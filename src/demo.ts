import { Matrix } from './api/math/Matrix';
import { Vector } from './api/math/Vector';
import { Cube } from './api/util/cube/Cube';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const cube = new Cube(new Vector(0, 0, 0));

const scale = 50;
const epsilon = 3;

const { projectionMatrix, zOffset } = Matrix.getProjectionMatrix(
  canvas,
  0.1,
  1000,
  30
);

if (ctx) ctx.strokeStyle = 'white';

let dt = 0.8;
let angle = 0;

function render() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);

  ctx?.translate(canvas.width / 2, canvas.height / 2);
  cube._mesh.forEach(([p1, p2, p3]) => {
    const rotatedP1 = Vector.rotX(Vector.rotZ(p1, angle), angle);
    const rotatedP2 = Vector.rotX(Vector.rotZ(p2, angle), angle);
    const rotatedP3 = Vector.rotX(Vector.rotZ(p3, angle), angle);

    const translatedP1 = Vector.add(rotatedP1, new Vector(0, 0, epsilon));
    const translatedP2 = Vector.add(rotatedP2, new Vector(0, 0, epsilon));
    const translatedP3 = Vector.add(rotatedP3, new Vector(0, 0, epsilon));

    const projectedP1 = projectionMatrix.mult(translatedP1.matrix).vector;
    const projectedP2 = projectionMatrix.mult(translatedP2.matrix).vector;
    const projectedP3 = projectionMatrix.mult(translatedP3.matrix).vector;

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
    ctx?.stroke();
  });
  ctx?.translate(-canvas.width / 2, -canvas.height / 2);

  angle += dt;

  window.requestAnimationFrame(render);
}

render();
