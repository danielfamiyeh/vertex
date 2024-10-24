import { Collider } from './Collider';
import { RigidBody } from '../rigid-body/RigidBody';
import { Vector } from '../../math/vector/Vector';
import { Sphere } from '../../math/sphere/Sphere';

export class SphereCollider implements Collider {
  isActive = false;
  isColliding = false;

  constructor(
    private _body: RigidBody  | undefined,
    private _otherBody: RigidBody | undefined,
    public callback: Function
  ) {}

  handleCollision() {
    if(!this._body || !this._otherBody) throw new Error('')

    // To be completely honest I'm not entirely sure why another division by two
    // on the radius makes sphere-sphere collison detection work, but it does
    const calculatedSphereA = new Sphere(
      Vector.add(this._body.boundingSphere.position, this._body.position),
      this._body.boundingSphere.radius / 2
    );

    const calculatedSphereB = new Sphere(
      Vector.add(
        this._otherBody.boundingSphere.position,
        this._otherBody.position
      ),
      this._otherBody.boundingSphere.radius / 2
    );

    if (calculatedSphereA.isIntersectingSphere(calculatedSphereB)) {
      this.callback();
      return (this.isColliding = true);
    }
    return (this.isColliding = false);
  }
}
