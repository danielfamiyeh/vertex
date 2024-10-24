import { Mesh } from '@vertex/api/graphics/mesh/Mesh';
import { Vector } from '@vertex/api/math/vector/Vector';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { Collider } from '../../physics/collider/Collider';

export class Entity {
  public mesh?: Mesh;
  public scale?: Vector;
  public body?: RigidBody;
  public colliders: Record<string, Collider> = {};

  constructor(private readonly _id: string) {}

  get id() {
    return this._id;
  }
}
