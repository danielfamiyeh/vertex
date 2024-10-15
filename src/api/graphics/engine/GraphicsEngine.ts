import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/Matrix';
import { Vector } from '../../math/Vector';
import { Color } from '../../graphics/color/Color';
import { GraphicsEngineOptions } from './GraphicsEngine.types';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from './GraphicsEngine.constants';

let dt = 0.8;
let angle = 0;

export class GraphicsEngine {
  private ctx: CanvasRenderingContext2D | null;
  private projectionMatrix: Matrix;
  private zOffset: number;
  private zShift: Vector;
  private scale: number;
  private camera: Camera;
  private timeElapsed = 0;

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
  }

  render(meshes: Vector[][][]) {
    const { ctx, camera, canvas, projectionMatrix, zOffset, zShift, scale } =
      this;

    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.translate(canvas.width / 2, canvas.height / 2);

    meshes.forEach((mesh) => {
      mesh.forEach(([p1, p2, p3]) => {
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

        const { x: x1, y: y1 } = Vector.div(projectedP1, projectedP1.z);
        const { x: x2, y: y2 } = Vector.div(projectedP2, projectedP2.z);
        const { x: x3, y: y3 } = Vector.div(projectedP3, projectedP3.z);

        ctx?.beginPath();
        ctx?.moveTo(scale * x1, -scale * y1);
        ctx?.lineTo(scale * x2, -scale * y2);
        ctx?.lineTo(scale * x3, -scale * y3);
        ctx?.lineTo(scale * x1, -scale * y1);
        ctx?.fill();
        ctx?.stroke();
      });
    });

    ctx?.translate(-canvas.width / 2, -canvas.height / 2);

    angle += dt;
    this.timeElapsed++;
    window.requestAnimationFrame(() => this.render(meshes));
  }
}
