import { Vector } from '../../math/vector/Vector';
import { Color } from '../color/Color';

export class Camera {
  constructor(
    private _position: Vector,
    private _direction = new Vector(0, 0, 1)
  ) {
    addEventListener('keydown', (event) => {
      console.log(event.key);
      if (event.key.toLowerCase() === 'w') {
        this._position.y += 0.01;
      }

      if (event.key.toLowerCase() === 's') {
        this._position.y -= 0.01;
      }

      if (event.key.toLowerCase() === 'a') {
        this._position.x -= 0.01;
      }

      if (event.key.toLowerCase() === 'd') {
        this._position.x += 0.01;
      }
    });
  }

  shouldCull(p1: Vector, p2: Vector, p3: Vector, epsilon = 0.05) {
    const pNormal = Vector.sub(p2, p1)
      .cross(Vector.sub(p3, p1))
      .normalize()
      .extend(0);

    const raySimilarity = Vector.sub(p1, this.position)
      .normalize()
      .dot(pNormal);
    return { pNormal, raySimilarity, shouldCull: raySimilarity < epsilon };
  }

  illuminate(normal: Vector) {
    const light = new Vector(0, 0, -1).normalize();

    const raySimilarity = light.dot(normal);
    const brightness = raySimilarity;

    let color = new Color({
      type: 'rgb',
      comps: [128, 255, 255],
    }).RGBToHSV();
    color.comps[2] = brightness;

    return { color };
  }

  get position() {
    return this._position;
  }

  get direction() {
    return this._direction;
  }
}
