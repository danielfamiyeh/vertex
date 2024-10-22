import { Vector } from '@vertex/api/math/vector/Vector';
import { RigidBodyOptions } from './RigidBody.utils';
import { Entity } from '@vertex/api/game/entity/Entity';
import { RigidBodyTransform } from './RigidBody.types';

export class RigidBody {
  private _position: Vector;
  private _rotation: Vector;
  private _mass: number;
  private _transforms: Record<string, RigidBodyTransform>;
  private _forces: Record<string, Vector> = {};

  constructor(options: RigidBodyOptions) {
    this._position = options.position;
    this._rotation = options.rotation;
    this._mass = options.mass ?? 1;
    this._forces = options.forces ?? {};
    this._transforms = options.transforms ?? {};
  }

  update(dTime: number, entities: Record<string, Entity>) {
    const { transforms } = this;
    Object.keys(transforms).forEach((id) => {
      transforms[id].bind(this)(dTime, this, entities);
    });
  }

  get position() {
    return this._position;
  }

  get rotation() {
    return this._rotation;
  }

  get mass() {
    return this._mass;
  }

  get transforms() {
    return this._transforms;
  }

  get forces() {
    return this._forces;
  }
}
