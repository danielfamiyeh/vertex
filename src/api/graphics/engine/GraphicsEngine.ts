import { Mesh } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { GraphicsEngineOptions, Raster } from './GraphicsEngine.types';
import {
  GRAPHICS_ENGINE_OPTIONS_DEFAULTS,
  pipeline,
} from './GraphicsEngine.utils';

import { getProjectionMatrix } from '../../math/matrix/Matrix.utils';

let dt = 0.8;
let angle = 0;

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

    this.meshes = [];

    if (_options.useWorker && Worker) {
      this.worker = new Worker('./pipeline-worker.ts');
      this.worker.addEventListener('message', this.handleWorkerRender);
    }

    this.queue = [];
    window.vertexGameEngine.graphics = this;
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
    await Promise.all(meshes).then((meshes) => {
      this.meshes.push(...meshes);
    });
  }

  private handleWorkerRender(event: MessageEvent) {
    const { ctx, canvas } = this;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.translate(canvas.width / 2, canvas.height / 2);

    window.vertexGraphicsEngine.graphics?.queue.push(event.data);

    ctx?.translate(-canvas.width / 2, -canvas.height / 2);
  }

  render() {
    const { ctx, canvas, camera, scale, queue } = this;

    if (this.worker) {
      this.worker?.postMessage({
        projectionMatrix: this.projectionMatrix,
        zOffset: this.zOffset,
        meshes: this.meshes,
        zShift: this.zShift,
        camera,
        scale,
      });

      const raster = queue.shift();

      if (raster) {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.translate(canvas.width / 2, canvas.height / 2);
        pipeline.screen(raster, ctx, scale);

        ctx?.translate(-canvas.width / 2, -canvas.height / 2);
      }
    } else {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.translate(canvas.width / 2, canvas.height / 2);

      pipeline.screen(
        pipeline.rasterize(
          pipeline.geometry({
            projectionMatrix: this.projectionMatrix,
            zOffset: this.zOffset,
            meshes: this.meshes,
            zShift: this.zShift,
            camera,
          }),
          camera
        ),
        ctx,
        scale
      );

      ctx?.translate(-canvas.width / 2, -canvas.height / 2);
      angle += dt;
    }
    window.requestAnimationFrame(this.render.bind(this));
  }
}
