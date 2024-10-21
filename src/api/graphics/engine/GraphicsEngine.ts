import { Mesh } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { GraphicsEngineOptions } from './GraphicsEngine.types';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from './GraphicsEngine.utils';
import { Triangle } from '../triangle/Triangle';
import { cameraBounds } from '../camera/Camera.utils';
import { Entity } from '@vertex/api/game/entity/Entity';

let printed = false;
export class GraphicsEngine {
  // TODO: Underscore all private class members
  private ctx: CanvasRenderingContext2D | null;
  private projectionMatrix: Matrix;
  private zOffset: number;
  private zShift: Vector;
  private scale: number;
  private camera: Camera;
  private _meshes: Record<string, Mesh> = {};
  private lastFrame = Date.now();
  private fps: number;

  static angle = 180;
  static dt = 4;

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

    this.fps = _options.fps;
    this.zShift = _options.zShift;
    this.scale = _options.scale;

    const { projectionMatrix, zOffset } = Matrix.projectionMatrix(
      canvas,
      _options.camera.near,
      _options.camera.far,
      _options.camera.fieldOfView
    );

    this.projectionMatrix = projectionMatrix;
    this.zOffset = zOffset;

    this.camera = new Camera({
      position: _options.camera.position,
      direction: _options.camera.direction,
      displacement: _options.camera.displacement,
      near: _options.camera.near,
      far: _options.camera.far,
      bottom: canvas.height,
      right: canvas.width,
    });

    this._meshes = {};
  }

  geometry(entities: Record<string, Entity>) {
    const { zShift, camera, projectionMatrix, zOffset } = this;
    const entityIds = Object.keys(entities);

    const raster: Triangle[] = [];
    const toRaster: Triangle[] = [];

    const { viewMatrix } = Matrix.viewMatrix(camera);

    GraphicsEngine.angle += GraphicsEngine.dt;

    entityIds.forEach((id) => {
      const mesh = entities[id].mesh;
      if (!mesh) return;
      mesh.triangles.forEach(([p1, p2, p3]) => {
        const worldMatrix = Matrix.worldMatrix(
          new Vector(0, GraphicsEngine.angle, 0),
          zShift
        );

        const worldP1 = worldMatrix.mult(p1.matrix).vector;
        const worldP2 = worldMatrix.mult(p2.matrix).vector;
        const worldP3 = worldMatrix.mult(p3.matrix).vector;

        const pNormal = Vector.sub(worldP2, worldP1)
          .cross(Vector.sub(worldP3, worldP1))
          .normalize()
          .extend(0);

        const raySimilarity = Vector.sub(
          Vector.extended(camera.position, 1),
          worldP1
        )
          .normalize()
          .dot(pNormal);

        // TODO: Use Camera.shouldCull
        if (raySimilarity < 0) return;

        const viewP1 = worldP1.rowMatrix.mult(viewMatrix).vector.columnMatrix;
        const viewP2 = worldP2.rowMatrix.mult(viewMatrix).vector.columnMatrix;
        const viewP3 = worldP3.rowMatrix.mult(viewMatrix).vector.columnMatrix;

        const clippedTriangles = camera.frustrum.near.clipTriangle([
          viewP1.vector,
          viewP2.vector,
          viewP3.vector,
        ]);

        clippedTriangles.forEach(
          ([clippedP1, clippedP2, clippedP3]: Vector[]) => {
            const projectedP1 = projectionMatrix.mult(
              clippedP1.columnMatrix
            ).vector;
            const projectedP2 = projectionMatrix.mult(
              clippedP2.columnMatrix
            ).vector;
            const projectedP3 = projectionMatrix.mult(
              clippedP3.columnMatrix
            ).vector;

            projectedP1.comps[2] -= zOffset;
            projectedP2.comps[2] -= zOffset;
            projectedP3.comps[2] -= zOffset;

            const finalP1 = Vector.div(projectedP1, projectedP1.z).scale(
              this.scale
            );
            const finalP2 = Vector.div(projectedP2, projectedP2.z).scale(
              this.scale
            );
            const finalP3 = Vector.div(projectedP3, projectedP3.z).scale(
              this.scale
            );

            toRaster.push(
              new Triangle(
                [finalP1, finalP2, finalP3],
                (projectedP1.z + projectedP2.z + projectedP3.z) / 3,
                pNormal,
                ''
              )
            );
          }
        );
      });
    });

    toRaster.sort((a, b) => b.zMidpoint - a.zMidpoint);

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
    raster.forEach((rasterObj) => {
      const { color } = this.camera.illuminate(rasterObj.worldNormal);
      rasterObj.color = `#${color.toHex()}`;
    });

    return raster;
  }

  screen(raster: Triangle[]) {
    const { ctx, canvas, scale } = this;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.translate(canvas.width / 2, canvas.height / 2);
    raster.forEach((raster) => {
      if (!ctx) return;

      const {
        points: [p1, p2, p3],
        color,
      } = raster;
      ctx.fillStyle = color;

      ctx?.beginPath();
      ctx?.moveTo(p1.x, -p1.y);
      ctx?.lineTo(p2.x, -p2.y);
      ctx?.lineTo(p3.x, -p3.y);
      ctx?.lineTo(p1.x, -p1.y);
      ctx?.fill();
    });

    ctx?.translate(-canvas.width / 2, -canvas.height / 2);
  }

  async loadMesh(url: string) {
    const res = await fetch(url);
    const file = await res.text();

    const meshData = {
      name: '',
      vertices: [] as Vector[],
      triangles: [] as Vector[][],
    };

    file.split('\n').forEach((line, i) => {
      if (line.startsWith('o')) {
        meshData.name = line.slice(2);
      } else if (line.startsWith('v')) {
        meshData.vertices.push(
          new Vector(
            ...line
              .slice(2)
              .split(' ')
              .map((v) => parseFloat(v)),
            1
          )
        );
      } else if (line.startsWith('f')) {
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
    this._meshes[url] = mesh;
    return mesh;
  }

  render(entities: Record<string, Entity>) {
    const now = Date.now();
    const interval = 1000 / this.fps;
    const delta = now - this.lastFrame;

    if (delta > interval) {
      this.screen(this.rasterize(this.geometry(entities)));
      this.lastFrame = now - (delta % interval);
    }

    window.requestAnimationFrame(this.render.bind(this, entities));
  }

  get meshes() {
    return this._meshes;
  }
}
