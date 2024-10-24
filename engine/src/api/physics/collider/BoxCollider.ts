import { Vector } from '../../math/vector/Vector';
import { RigidBody } from '../rigid-body/RigidBody';
import { Collider } from './Collider';

export class BoxCollider implements Collider {
  isActive = false;
  constructor(
    private _body: RigidBody,
    private _min: Vector,
    private _max: Vector
  ) {}

  handleCollision(bodyB: RigidBody) {
    return false;
  }

  get min() {
    return this._min;
  }

  get max() {
    return this._max;
  }
}
