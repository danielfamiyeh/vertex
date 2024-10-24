import { Entity } from '../../game/entity/Entity';
import { RigidBody } from './RigidBody';

export type RigidBodyTransform = (
  dTime: number,
  self: RigidBody,
  entities: Record<string, Entity>
) => void;
