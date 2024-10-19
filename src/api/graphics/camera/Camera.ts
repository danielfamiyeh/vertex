import { Vector } from '../../math/vector/Vector';
import { CameraFrustrum } from './Camera.types';
import { Color } from '../color/Color';
import { Plane } from '../../math/plane/Plane';

export class Camera {
  private _frustrum: CameraFrustrum;

  constructor(
    private _position: Vector,
    private near: number,
    private far: number,
    private _direction = new Vector(0, 0, 1),
    private _displacement = 0.2
  ) {
    this._frustrum = {
      near: new Plane(new Vector(0, 0, near), new Vector(0, 0, 1)),
    };

    addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        this._position.y += _displacement;
      }

      if (event.key === 'ArrowDown') {
        this._position.y -= _displacement;
      }

      if (event.key === 'ArrowLeft') {
        this._position.x -= _displacement;
      }

      if (event.key === 'ArrowRight') {
        this._position.x += _displacement;
      }

      if (event.key.toLowerCase() === 'a') {
        this._direction.x -= _displacement / 2;
      }

      if (event.key.toLowerCase() === 'd') {
        this._direction.x += _displacement / 2;
      }

      if (event.key.toLowerCase() === 'w') {
        this._position.add(Vector.scale(this._direction, this._displacement));
      }

      if (event.key.toLowerCase() === 's') {
        this._position.sub(Vector.scale(this._direction, this._displacement));
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

  get displacement() {
    return this._displacement;
  }

  set displacement(d: number) {
    this._displacement = d;
  }

  get frustrum() {
    return this._frustrum;
  }
}
