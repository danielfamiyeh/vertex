import { Vector } from '../../math/Vector';
import { Color } from '../color/Color';

export class Camera {
  constructor(private _position: Vector) {}

  shouldCull(p1: Vector, p2: Vector, p3: Vector, epsilon = 0.05) {
    const pNormal = Vector.sub(p2, p1).cross(Vector.sub(p3, p1)).normalize();

    const raySimilarity = Vector.sub(this._position, p1)
      .normalize()
      .dot(pNormal);

    return { pNormal, raySimilarity, shouldCull: raySimilarity < epsilon };
  }

  illuminate(normal: Vector) {
    const light = new Vector(0, 0, -1).normalize();

    const raySimilarity = light.dot(normal);
    const brightness = Math.max(0.1, raySimilarity);

    let color = new Color({
      type: 'rgb',
      comps: [128, 255, 255],
    }).RGBToHSV();
    color.comps[2] = brightness;

    return { color: color.HSVtoRGB() };
  }

  get position() {
    return this._position;
  }
}