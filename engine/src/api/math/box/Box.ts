import { Vector } from '../vector/Vector';

export class Box {
  constructor(
    private _position: Vector,
    private _min: Vector,
    private _max: Vector
  ) {}

  // TODO
  intersectsPoint(point: Vector) {}

  //
  intersectsBox(box: Box) {}

  get position() {
    return this._position;
  }

  set position(v: Vector) {
    this._position = v;
  }

  get min() {
    return this._min;
  }

  get max() {
    return this._max;
  }
}
