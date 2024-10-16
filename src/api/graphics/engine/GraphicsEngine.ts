import { Mesh } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/Matrix';
import { Vector } from '../../math/Vector';
import { GraphicsEngineOptions } from './GraphicsEngine.types';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from './GraphicsEngine.constants';

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

    const { projectionMatrix, zOffset } = Matrix.getProjectionMatrix(
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

  render() {
    const {
      ctx,
      camera,
      canvas,
      projectionMatrix,
      zOffset,
      zShift,
      scale,
      _meshes,
    } = this;

    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.translate(canvas.width / 2, canvas.height / 2);

    const raster: { face: Vector[]; zMidpoint: number; pNormal: Vector }[] = [];

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

        const { color } = camera.illuminate(pNormal);

        if (ctx) ctx.fillStyle = `#${color.toHex()}`;

        const projectedP1 = projectionMatrix.mult(transformedP1.matrix).vector;
        const projectedP2 = projectionMatrix.mult(transformedP2.matrix).vector;
        const projectedP3 = projectionMatrix.mult(transformedP3.matrix).vector;

        projectedP1.comps[2] -= zOffset;
        projectedP2.comps[2] -= zOffset;
        projectedP3.comps[2] -= zOffset;

        raster.push({
          face: [projectedP1, projectedP2, projectedP3],
          zMidpoint: (projectedP1.z + projectedP2.z + projectedP3.z) / 3,
          pNormal,
        });
      });
    });

    raster.sort((a, b) => b.zMidpoint - a.zMidpoint);

    raster.forEach(({ face: [p1, p2, p3], pNormal }) => {
      const { color } = camera.illuminate(pNormal);

      if (ctx) ctx.fillStyle = `#${color.toHex()}`;

      const { x: x1, y: y1 } = Vector.div(p1, p1.z);
      const { x: x2, y: y2 } = Vector.div(p2, p2.z);
      const { x: x3, y: y3 } = Vector.div(p3, p3.z);

      ctx?.beginPath();
      ctx?.moveTo(scale * x1, -scale * y1);
      ctx?.lineTo(scale * x2, -scale * y2);
      ctx?.lineTo(scale * x3, -scale * y3);
      ctx?.lineTo(scale * x1, -scale * y1);
      ctx?.fill();
    });

    ctx?.translate(-canvas.width / 2, -canvas.height / 2);

    angle += dt;
    window.requestAnimationFrame(this.render.bind(this));
  }
}
