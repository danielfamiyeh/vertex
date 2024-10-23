import { RigidBody } from '../rigid-body/RigidBody';

export interface Collider {
  isActive: boolean;
  callback: Function;
  handleCollision(): boolean;
}
