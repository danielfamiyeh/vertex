import { Vector } from './api/math/Vector';
import { Cube } from './api/util/cube/Cube';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const cube = new Cube(new Vector(-0.5, 0.5, 0.5));

const scale = 25;
const epsilon = 0.001; // To avoid division by zero error

if (ctx) ctx.strokeStyle = 'white';

ctx?.translate(canvas.width / 2, canvas.height / 2);
cube._mesh.forEach(([p1, p2, p3]) => {
  const { x: x1, y: y1 } = Vector.div(p1, p1.z + epsilon);
  const { x: x2, y: y2 } = Vector.div(p2, p2.z + epsilon);
  const { x: x3, y: y3 } = Vector.div(p3, p3.z + epsilon);

  ctx?.beginPath();
  ctx?.moveTo(scale * x1, -scale * y1);
  ctx?.lineTo(scale * x2, -scale * y2);
  ctx?.lineTo(scale * x3, -scale * y3);
  ctx?.lineTo(scale * x1, -scale * y1);
  ctx?.stroke();
});
