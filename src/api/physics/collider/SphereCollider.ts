import { Collider } from './Collider';
import { RigidBody } from '../rigid-body/RigidBody';

export class SphereCollider implements Collider {
  isColliding(bodyA: RigidBody, bodyB: RigidBody): boolean {
    const distance = bodyB.position.sub(bodyA.position).mag;
    return true;
  }
}
