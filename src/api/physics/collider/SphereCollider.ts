import { Collider } from './Collider';
import { RigidBody } from '../rigid-body/RigidBody';
import { Vector } from '../../math/vector/Vector';
export class SphereCollider implements Collider {
  isActive = false;

  constructor(private _body: RigidBody) {}

  isColliding(bodyB: RigidBody): boolean {
    return this._body.boundingSphere.isIntersectingSphere(bodyB.boundingSphere);
  }
}
