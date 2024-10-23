import { RigidBody } from '../rigid-body/RigidBody';

export interface Collider {
  isColliding(entityA: RigidBody, entityB: RigidBody): boolean;
}
