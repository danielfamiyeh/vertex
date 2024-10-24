import { Vector } from '../../math/vector/Vector';

export class Mesh {
  constructor(
    private readonly _name: string,
    private readonly _vertices: Vector[],
    private readonly _triangles: Vector[][]
  ) {}

  get vertices() {
    return this._vertices;
  }

  get triangles() {
    return this._triangles;
  }

  get name() {
    return this._name;
  }
}
