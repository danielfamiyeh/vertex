import { Mesh } from '@vertex/api/graphics/mesh/Mesh';
import { RigidBody } from '@vertex/api/phyisics/rigid-body/RigidBody';

export class Entity {
  public mesh?: Mesh;
  public rigidBody?: RigidBody;
  constructor(private id: string) {}
}
