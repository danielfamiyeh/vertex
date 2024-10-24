import { Vector } from '../../math/vector/Vector';
import { CameraFrustrum, CameraOptions } from './Camera.types';
import { Color } from '../color/Color';
import { Plane } from '../../math/plane/Plane';

const upVector = new Vector(0, 1, 0);

export class Camera {
  private _frustrum: CameraFrustrum;
  private _position: Vector;
  private _direction: Vector;
  private _displacement: number;

  constructor(options: CameraOptions) {
    this._position = options.position;
    this._direction = options.direction;
    this._displacement = options.displacement;

    this._frustrum = {
      // TODO: Why are some of these flipped?
      near: new Plane(new Vector(0, 0, options.near), new Vector(0, 0, 1)),
      far: new Plane(new Vector(0, 0, options.far), new Vector(0, 0, -1)),
      left: new Plane(
        new Vector(options.right / 2 + 1, 0, 0),
        new Vector(1, 0, 0)
      ),
      right: new Plane(
        new Vector(-(options.right / 2) - 1, 0, 0),
        new Vector(-1, 0, 0)
      ),
      top: new Plane(
        new Vector(0, -(options.bottom / 2) - 1, 0),
        new Vector(0, -1, 0)
      ),
      bottom: new Plane(
        new Vector(0, options.bottom / 2 + 1, 0),
        new Vector(0, 1, 0)
      ),
    };

    addEventListener('keydown', this.defaultControlsListener.bind(this));
  }

  defaultControlsListener(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this._position.y += this._displacement;
    }

    if (event.key === 'ArrowDown') {
      this._position.y -= this._displacement;
    }

    if (event.key === 'ArrowLeft') {
      const left = this.direction
        .cross(upVector)
        .normalize()
        .scale(this._displacement);

      this.position.add(left);
    }

    if (event.key === 'ArrowRight') {
      const right = this.direction
        .cross(upVector)
        .normalize()
        .scale(-this._displacement);

      this.position.add(right);
    }

    if (event.key.toLowerCase() === 'a') {
      this._direction.x -= this._displacement / 10;
    }

    if (event.key.toLowerCase() === 'd') {
      this._direction.x += this._displacement / 10;
    }

    if (event.key.toLowerCase() === 'w') {
      this._position.add(Vector.scale(this._direction, this._displacement));
    }

    if (event.key.toLowerCase() === 's') {
      this._position.sub(Vector.scale(this._direction, this._displacement));
    }
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
