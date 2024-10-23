import { Vector } from '../vector/Vector';

export class Sphere {
  constructor(private _position: Vector, private _radius: number) {}

  isIntersectingSphere(s: Sphere) {
    const d = Vector.sub(s.position, this.position).mag;
    return d < this.radius + s.radius;
  }

  get position() {
    return this._position;
  }

  set position(v: Vector) {
    this._position = v;
  }

  get radius() {
    return this._radius;
  }
}
