import { Mesh } from '@vertex/api/graphics/mesh/Mesh';
import { Vector } from '@vertex/api/math/vector/Vector';
import { RigidBody } from '@vertex/api/phyisics/rigid-body/RigidBody';

export class Entity {
  public mesh?: Mesh;
  public scale?: Vector;
  public body?: RigidBody;
  constructor(private id: string) {}
}
