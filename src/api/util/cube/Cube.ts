import { Vector } from '../../math/Vector';

export class Cube {
  _triangles: Vector[];
  _mesh: Vector[][];

  constructor(origin: Vector) {
    this._triangles = [];
    this._mesh = [];

    //Front Vertices
    this._triangles.push(new Vector(origin.x, origin.y, origin.z));
    this._triangles.push(new Vector(origin.x, origin.y + 1, origin.z));
    this._triangles.push(new Vector(origin.x + 1, origin.y + 1, origin.z));
    this._triangles.push(new Vector(origin.x + 1, origin.y, origin.z));

    //Back Vertices
    this._triangles.push(new Vector(origin.x, origin.y, origin.z + 1));
    this._triangles.push(new Vector(origin.x, origin.y + 1, origin.z + 1));
    this._triangles.push(new Vector(origin.x + 1, origin.y + 1, origin.z + 1));
    this._triangles.push(new Vector(origin.x + 1, origin.y, origin.z + 1));

    //Front Mesh
    this._mesh.push([
      this._triangles[0],
      this._triangles[2],
      this._triangles[3],
    ]);
    this._mesh.push([
      this._triangles[0],
      this._triangles[1],
      this._triangles[2],
    ]);

    //RHS
    this._mesh.push([
      this._triangles[3],
      this._triangles[6],
      this._triangles[7],
    ]);
    this._mesh.push([
      this._triangles[3],
      this._triangles[2],
      this._triangles[6],
    ]);

    //Back
    this._mesh.push([
      this._triangles[7],
      this._triangles[5],
      this._triangles[4],
    ]);
    this._mesh.push([
      this._triangles[7],
      this._triangles[6],
      this._triangles[5],
    ]);

    //LHS
    this._mesh.push([
      this._triangles[4],
      this._triangles[1],
      this._triangles[0],
    ]);
    this._mesh.push([
      this._triangles[4],
      this._triangles[5],
      this._triangles[1],
    ]);

    //Top
    this._mesh.push([
      this._triangles[1],
      this._triangles[6],
      this._triangles[2],
    ]);
    this._mesh.push([
      this._triangles[1],
      this._triangles[5],
      this._triangles[6],
    ]);

    //Bottom
    this._mesh.push([
      this._triangles[4],
      this._triangles[3],
      this._triangles[7],
    ]);
    this._mesh.push([
      this._triangles[4],
      this._triangles[0],
      this._triangles[3],
    ]);
  }

  get mesh() {
    return this._mesh;
  }

  get triangles() {
    return this._triangles;
  }
}
