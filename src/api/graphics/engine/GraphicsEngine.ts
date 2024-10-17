import { Mesh } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import {
  GeometryPipelineArgs,
  GraphicsEngineOptions,
  Raster,
} from './GraphicsEngine.types';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from './GraphicsEngine.utils';

import { getProjectionMatrix } from '../../math/matrix/Matrix.utils';

let printed = false;

export class GraphicsEngine {
  // TODO: Underscore all private class members
  private ctx: CanvasRenderingContext2D | null;
  private projectionMatrix: Matrix;
  private worker?: Worker;
  private zOffset: number;
  private zShift: Vector;
  private scale: number;
  private camera: Camera;
  private meshes: Mesh[];
  public queue: Raster[];
  private lastFrame = Date.now();
  private fps: number;

  static angle = 0;
  static dt = 4;

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

    this.fps = _options.fps;
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

    this.meshes = [];

    if (_options.useWorker && Worker) {
      this.worker = new Worker('./pipeline-worker.ts');
      this.worker.addEventListener('message', this.handleWorkerRender);
    }

    this.queue = [];
    window.vertexGameEngine.graphics = this;
  }

  static geometry(args: GeometryPipelineArgs) {
    const { meshes, zShift, camera, projectionMatrix, zOffset } = args;

    const raster: Raster = [];

    camera.position.__proto__ = Vector.prototype;
    GraphicsEngine.angle += GraphicsEngine.dt;

    meshes.forEach((mesh) => {
      mesh.triangles.forEach(([p1, p2, p3]) => {
        p1.__proto__ = Vector.prototype;
        p2.__proto__ = Vector.prototype;
        p3.__proto__ = Vector.prototype;

        const worldMatrix = Matrix.worldMatrix(
          new Vector(GraphicsEngine.angle, 0, GraphicsEngine.angle),
          zShift
        );

        const transformedP1 = worldMatrix.mult(p1.matrix).vector;
        const transformedP2 = worldMatrix.mult(p2.matrix).vector;
        const transformedP3 = worldMatrix.mult(p3.matrix).vector;

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

  static rasterize(raster: Raster, camera: Camera) {
    raster.sort((a, b) => b.zMidpoint - a.zMidpoint);

    raster.forEach((rasterObj) => {
      const { color } = camera.illuminate(rasterObj.pNormal);
      rasterObj.color = `#${color.toHex()}`;
    });

    return raster;
  }

  screen(raster: Raster) {
    const { ctx, canvas, scale } = this;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.translate(canvas.width / 2, canvas.height / 2);
    raster.forEach((raster) => {
      if (!ctx) return;
      raster.face.forEach((v) => (v.__proto__ = Vector.prototype));

      const {
        face: [p1, p2, p3],
        color,
      } = raster;
      ctx.fillStyle = color;

      ctx?.beginPath();
      ctx?.moveTo(scale * p1.x, -scale * p1.y);
      ctx?.lineTo(scale * p2.x, -scale * p2.y);
      ctx?.lineTo(scale * p3.x, -scale * p3.y);
      ctx?.lineTo(scale * p1.x, -scale * p1.y);
      ctx?.fill();
    });

    ctx?.translate(-canvas.width / 2, -canvas.height / 2);
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

    return new Mesh(meshData.name, meshData.vertices, meshData.triangles);
  }

  async loadMeshes(...urls: string[]) {
    const meshes = urls.map((url) => GraphicsEngine.loadMesh(url));

    return await Promise.all(meshes).then((meshes) => {
      this.meshes.push(...meshes);
    });
  }

  private handleWorkerRender(event: MessageEvent) {
    window.vertexGameEngine.graphics?.queue.push(event.data);
  }

  render() {
    if (this.worker) {
      this.worker?.postMessage({
        projectionMatrix: this.projectionMatrix,
        zOffset: this.zOffset,
        meshes: this.meshes,
        zShift: this.zShift,
        camera: this.camera,
        scale: this.scale,
      });
    }

    const interval = 1000 / this.fps;
    const now = Date.now();
    const delta = now - this.lastFrame;

    if (delta > interval) {
      if (this.worker) {
        const raster = this.queue.shift();
        if (raster) this.screen(raster);
      } else {
        this.screen(
          GraphicsEngine.rasterize(
            GraphicsEngine.geometry({
              projectionMatrix: this.projectionMatrix,
              zOffset: this.zOffset,
              meshes: this.meshes,
              zShift: this.zShift,
              camera: this.camera,
            }),
            this.camera
          )
        );
      }
      this.lastFrame = now - (delta % interval);
    }

    window.requestAnimationFrame(this.render.bind(this));
  }
}
