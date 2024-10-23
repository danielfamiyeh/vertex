import { Collider } from './Collider';
import { RigidBody } from '../rigid-body/RigidBody';

export class SphereCollider implements Collider {
  isActive = false;

  constructor(
    private _body: RigidBody,
    private _otherBody: RigidBody,
    public callback: Function
  ) {}

  handleCollision() {
    if (
      this._body.boundingSphere.isIntersectingSphere(
        this._otherBody.boundingSphere
      )
    ) {
      this.callback();
      return true;
    }
    return false;
  }
}
