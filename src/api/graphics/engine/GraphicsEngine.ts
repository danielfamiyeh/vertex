import { Mesh } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { GraphicsEngineOptions, Raster } from './GraphicsEngine.types';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from './GraphicsEngine.constants';

import { getProjectionMatrix } from '../../math/matrix/Matrix.utils';

let dt = 0.8;
let angle = 0;

export class GraphicsEngine {
  // TODO: Underscore all private class members
  private ctx: CanvasRenderingContext2D | null;
  private projectionMatrix: Matrix;
  private zOffset: number;
  private zShift: Vector;
  private scale: number;
  private camera: Camera;
  private _meshes: Mesh[];

  constructor(
    private canvas = document.getElementById('canvas') as HTMLCanvasElement,
    options?: GraphicsEngineOptions
  ) {
    this.ctx = this.canvas.getContext('2d');

    if (!this.ctx) throw new Error('Cannot access Canvas context');

    const _options = Object.assign(
      {},
      GRAPHICS_ENGINE_OPTIONS_DEFAULTS,
      options
    );

    this.ctx.strokeStyle = 'white';
    this.ctx.fillStyle = 'white';

    this.zShift = _options.zShift;
    this.scale = _options.scale;

    const { projectionMatrix, zOffset } = getProjectionMatrix(
      canvas,
      _options.nearPlane,
      _options.farPlane,
      _options.fieldOfView
    );

    this.projectionMatrix = projectionMatrix;
    this.zOffset = zOffset;

    this.camera = new Camera(_options.cameraPosition);

    this._meshes = [];
  }

  static async loadMesh(url: string) {
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
              .map((v) => parseFloat(v))
          )
        );
      } else if (line.startsWith('f')) {
        let [p1, p2, p3] = line.slice(2).split(' ');
        if (!p1 || !p2 || !p3) {
          throw new Error(
            `Error parsing face on line ${line + 1} of file ${url}.`
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

    return new Mesh(meshData.name, meshData.vertices, meshData.triangles);
  }

  async loadMeshes(...urls: string[]) {
    const meshes = urls.map((url) => GraphicsEngine.loadMesh(url));
    await Promise.all(meshes).then((meshes) => {
      this._meshes.push(...meshes);
    });
  }

  private geometry(meshes: Mesh[]) {
    const { _meshes, zShift, camera, projectionMatrix, zOffset } = this;

    const raster: Raster = [];

    _meshes.forEach((mesh) => {
      mesh.triangles.forEach(([p1, p2, p3]) => {
        const transformedP1 = Vector.rotX(Vector.rotZ(p1, angle), angle).add(
          zShift
        );
        const transformedP2 = Vector.rotX(Vector.rotZ(p2, angle), angle).add(
          zShift
        );
        const transformedP3 = Vector.rotX(Vector.rotZ(p3, angle), angle).add(
          zShift
        );

        const { shouldCull, pNormal } = camera.shouldCull(
          transformedP1,
          transformedP2,
          transformedP3
        );

        if (shouldCull) return;

        const projectedP1 = projectionMatrix.mult(transformedP1.matrix).vector;
        const projectedP2 = projectionMatrix.mult(transformedP2.matrix).vector;
        const projectedP3 = projectionMatrix.mult(transformedP3.matrix).vector;

        projectedP1.comps[2] -= zOffset;
        projectedP2.comps[2] -= zOffset;
        projectedP3.comps[2] -= zOffset;

        const finalP1 = Vector.div(projectedP1, projectedP1.z);
        const finalP2 = Vector.div(projectedP2, projectedP2.z);
        const finalP3 = Vector.div(projectedP3, projectedP3.z);

        raster.push({
          face: [finalP1, finalP2, finalP3],
          zMidpoint: (projectedP1.z + projectedP2.z + projectedP3.z) / 3,
          pNormal,
          color: '',
        });
      });
    });

    return raster;
  }

  private rasterize(raster: Raster) {
    const { camera } = this;

    raster.sort((a, b) => b.zMidpoint - a.zMidpoint);
    raster.forEach((rasterObj) => {
      const { color } = camera.illuminate(rasterObj.pNormal);
      rasterObj.color = `#${color.toHex()}`;
    });

    return raster;
  }

  private screen(raster: Raster) {
    const { ctx, scale } = this;

    raster.forEach(({ face: [p1, p2, p3], color }) => {
      if (ctx) ctx.fillStyle = color;

      ctx?.beginPath();
      ctx?.moveTo(scale * p1.x, -scale * p1.y);
      ctx?.lineTo(scale * p2.x, -scale * p2.y);
      ctx?.lineTo(scale * p3.x, -scale * p3.y);
      ctx?.lineTo(scale * p1.x, -scale * p1.y);
      ctx?.fill();
    });
  }

  render() {
    const { ctx, canvas, _meshes, geometry, rasterize, screen, render } = this;

    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.translate(canvas.width / 2, canvas.height / 2);

    screen.bind(this)(rasterize.bind(this)(geometry.bind(this)(_meshes)));

    ctx?.translate(-canvas.width / 2, -canvas.height / 2);

    angle += dt;
    window.requestAnimationFrame(render.bind(this));
  }
}
