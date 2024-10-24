import { Mesh } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { GraphicsEngineOptions } from './GraphicsEngine.types';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from './GraphicsEngine.utils';
import { Triangle } from '../triangle/Triangle';
import { cameraBounds } from '../camera/Camera.utils';
import { Entity } from '../../game/entity/Entity';
import { Sphere } from '../../math/sphere/Sphere';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { GameEngine } from '../../game/engine/GameEngine';

export class GraphicsEngine {
  // TODO: Underscore all private class members
  private ctx: CanvasRenderingContext2D | null;
  private projectionMatrix: Matrix;
  private zOffset: Vector;
  private camera: Camera;
  private _meshes: Record<string, Mesh> = {};
  private scale: number;

  static angle = 180;

  constructor(
    private canvas = document.getElementById('canvas') as HTMLCanvasElement,
    options?: GraphicsEngineOptions
  ) {
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    if (!this.ctx) throw new Error('Cannot access Canvas context');

    const _options = Object.assign(
      {},
      GRAPHICS_ENGINE_OPTIONS_DEFAULTS,
      options
    );

    this.ctx.strokeStyle = 'white';
    this.ctx.fillStyle = 'white';

    const { projectionMatrix, zOffset } = Matrix.projectionMatrix(
      canvas,
      _options.camera.near,
      _options.camera.far,
      _options.camera.fieldOfView
    );

    this.scale = options?.scale ?? canvas.width;
    this.projectionMatrix = projectionMatrix;
    this.zOffset = new Vector(0, 0, zOffset);

    this.camera = new Camera({
      position: _options.camera.position,
      direction: _options.camera.direction,
      displacement: _options.camera.displacement,
      near: _options.camera.near,
      far: _options.camera.far,
      bottom: canvas.height,
      right: canvas.width,
      rotation: _options.camera.rotation,
    });

    const cameraEntity = new Entity('__CAMERA__');

    cameraEntity.body = new RigidBody({
      position: this.camera.position,
      rotation: this.camera.direction,
    });

    // @ts-ignore
    (window.__VERTEX_GAME_ENGINE__ as GameEngine).entities.__CAMERA__ =
      cameraEntity;

    cameraEntity.body.forces.velocity = new Vector(0, 0, 0);
    cameraEntity.body.forces.rotation = new Vector(0, 0, 0);

    cameraEntity.body.transforms.move = () => {
      cameraEntity.body?.position.add(cameraEntity.body.forces.velocity);
    };

    cameraEntity.body.transforms.rotate = () => {
      cameraEntity.body?.rotation.add(cameraEntity.body.forces.rotation);
    };

    this._meshes = {};
  }
  // TODO: normalize model coordinates [-1,1] so that radius is 1

  geometry(entities: Record<string, Entity>) {
    const { camera, projectionMatrix, zOffset } = this;
    const entityIds = Object.keys(entities);

    const raster: Triangle[] = [];
    const toRaster: Triangle[] = [];

    const { viewMatrix } = Matrix.viewMatrix(camera);

    entityIds.forEach((id) => {
      const entity = entities[id];
      const mesh = entity.mesh;
      const worldMatrix = Matrix.worldMatrix(
        entity.body?.rotation,
        entity.body?.position
      );

      if (!mesh) return;

      mesh.triangles.forEach((modelPoints) => {
        const worldPoints = modelPoints.map(
          (point) => worldMatrix.mult(point.matrix).vector
        );

        const pNormal = Vector.sub(worldPoints[1], worldPoints[0])
          .cross(Vector.sub(worldPoints[2], worldPoints[0]))
          .normalize()
          .extend(0);

        const raySimilarity = Vector.sub(
          Vector.extended(camera.position, 1),
          worldPoints[0]
        )
          .normalize()
          .dot(pNormal);

        // TODO: Use Camera.shouldCull
        if (raySimilarity < 0) return;

        const viewPoints = worldPoints.map(
          (point) => point.rowMatrix.mult(viewMatrix).vector
        );

        // I'm guessing a depth buffer would help with this?
        const clippedTriangles = camera.frustrum.near.clipTriangle(viewPoints);

        clippedTriangles.forEach((points: Vector[]) => {
          const projectedPoints = points.map((point) =>
            projectionMatrix.mult(point.columnMatrix).vector.sub(zOffset)
          );

          const finalPoints = projectedPoints.map((point) =>
            Vector.div(point, point.z).scale(
              (this.canvas.height / this.canvas.width) * this.scale
            )
          );

          toRaster.push(
            new Triangle(
              finalPoints,
              (projectedPoints[0].z +
                projectedPoints[1].z +
                projectedPoints[2].z) /
                3,
              pNormal,
              ''
            )
          );
        });
      });
    });

    // Clipping routine
    toRaster.forEach((triangle) => {
      const queue: Triangle[] = [];
      queue.push(triangle);

      cameraBounds.forEach((bound) => {
        const _triangle = queue.pop();
        if (!_triangle) return;

        const clippedTriangles: Triangle[] = camera.frustrum[bound]
          .clipTriangle(_triangle.points)
          .map(
            (points) =>
              new Triangle(
                points,
                _triangle.zMidpoint,
                _triangle.worldNormal,
                _triangle.color
              )
          );

        queue.push(...clippedTriangles);
      });

      raster.push(...queue);
    });

    return raster;
  }

  rasterize(raster: Triangle[]) {
    raster.sort((a, b) => b.zMidpoint - a.zMidpoint);

    raster.forEach((rasterObj) => {
      const { color } = this.camera.illuminate(rasterObj.worldNormal);
      rasterObj.color = `#${color.toHex()}`;
    });

    return raster;
  }

  screen(raster: Triangle[]) {
    const { ctx, canvas } = this;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.translate(canvas.width / 2, canvas.height / 2);
    raster.forEach((raster) => {
      if (!ctx) return;

      const {
        points: [p1, p2, p3],
        color,
      } = raster;
      ctx.strokeStyle = color;

      ctx?.beginPath();
      ctx?.moveTo(p1.x, -p1.y);
      ctx?.lineTo(p2.x, -p2.y);
      ctx?.lineTo(p3.x, -p3.y);
      ctx?.lineTo(p1.x, -p1.y);
      ctx?.stroke();
    });

    ctx?.translate(-canvas.width / 2, -canvas.height / 2);
  }

  async loadMesh(id: string, url: string, scale: Vector) {
    const res = await fetch(url);
    const file = await res.text();

    const min = new Vector(Infinity, Infinity, Infinity);
    const max = new Vector(-Infinity, -Infinity, -Infinity);

    const meshData = {
      name: '',
      vertices: [] as Vector[],
      triangles: [] as Vector[][],
    };

    file.split('\n').forEach((line, i) => {
      const [type, ...parts] = line.replace(/\r/g, '').split(' ');

      if (type === 'o') {
        meshData.name = parts[0];
      } else if (type === 'v') {
        meshData.vertices.push(
          new Vector(
            ...parts.map((v, j) => {
              const _v = parseFloat(v) * scale.comps[j];
              if (_v < min.comps[j]) min.comps[j] = _v;
              if (_v > max.comps[j]) max.comps[j] = _v;

              return _v;
            }),
            1
          )
        );
      } else if (type === 'f') {
        let [p1, p2, p3] = line.slice(2).split(' ');
        if (!p1 || !p2 || !p3) {
          throw new Error(
            `Error parsing face on line ${i + 1} of file ${url}.`
          );
        }

        if (p1.includes('/')) {
          [p1] = p1.split('/');
          [p2] = p2.split('/');
          [p3] = p3.split('/');
        }
        meshData.triangles.push([
          meshData.vertices[parseInt(p1) - 1],
          meshData.vertices[parseInt(p2) - 1],
          meshData.vertices[parseInt(p3) - 1],
        ]);
      }
    });

    const mesh = new Mesh(meshData.name, meshData.vertices, meshData.triangles);
    // const boundingBox = new Box(min, max);
    const boundingSphere = new Sphere(
      Vector.add(min, max).scale(1 / 2),
      Vector.sub(max, min).mag / 2
    );

    this._meshes[id] = mesh;

    return { mesh, boundingSphere };
  }

  render(entities: Record<string, Entity>) {
    this.screen(this.rasterize(this.geometry(entities)));
  }

  get meshes() {
    return this._meshes;
  }
}
