import { Vector } from '@vertex/api/math/vector/Vector';
import { RigidBodyOptions } from './RigidBody.utils';

export class RigidBody {
  private _position: Vector;
  private _direction: Vector;
  private _mass: number;

  constructor(options: RigidBodyOptions) {
    this._position = options.position;
    this._direction = options.direction;
    this._mass = options.mass;
  }

  get position() {
    return this._position;
  }

  get direction() {
    return this._direction;
  }

  get mass() {
    return this._mass;
  }
}
