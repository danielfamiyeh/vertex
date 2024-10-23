import { RigidBody } from '../rigid-body/RigidBody';

export interface Collider {
  isActive: boolean;
  isColliding(entityA: RigidBody, entityB: RigidBody): boolean;
}
