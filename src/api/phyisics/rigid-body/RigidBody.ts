import { Vector } from '@vertex/api/math/vector/Vector';
import { RigidBodyOptions } from './RigidBody.utils';

export class RigidBody {
  private _position: Vector;
  private _rotation: Vector;
  private _mass: number;
  private _transforms: Record<string, Function> = {};

  constructor(options: RigidBodyOptions) {
    this._position = options.position;
    this._rotation = options.rotation;
    this._mass = options.mass;
  }

  update(dTime: number) {
    const { transforms } = this;
    Object.keys(transforms).forEach((id) => {
      transforms[id](dTime);
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
}
