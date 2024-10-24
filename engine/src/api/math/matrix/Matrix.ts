import { Camera } from '../../graphics/camera/Camera';
import { Vector } from '../vector/Vector';

export class Matrix {
  _mat: number[][];
  constructor(public rows: number, public cols: number) {
    this._mat = [];

    for (let i = 0; i < rows; i++) {
      this._mat.push(new Array(cols));
      for (let j = 0; j < cols; j++) {
        this._mat[i][j] = 0;
      }
    }
  }

  static viewMatrix(camera: Camera) {
    const { position, direction } = camera;
    const target = Vector.add(position, direction);
    const tempYAxis = new Vector(0, 1, 0);

    const newZAxis = Vector.sub(target, position).normalize();
    const newXAxis = tempYAxis.cross(newZAxis).normalize();
    const newYAxis = newZAxis.cross(newXAxis).normalize();

    const translation = new Vector(
      position.dot(newXAxis),
      position.dot(newYAxis),
      position.dot(newZAxis)
    );

    const cameraMatrix = Matrix.identity(4);
    const viewMatrix = Matrix.identity(4);

    cameraMatrix._mat = [
      [...newXAxis.comps, translation.x],
      [...newYAxis.comps, translation.z],
      [...newZAxis.comps, translation.y],
      [0, 0, 0, 1],
    ];

    viewMatrix._mat = [
      [newXAxis.x, newYAxis.x, newZAxis.x, 0],
      [newXAxis.y, newYAxis.y, newZAxis.y, 0],
      [newXAxis.z, newYAxis.z, newZAxis.z, 0],
      [...Vector.scale(translation, -1).comps, 1],
    ];

    return { cameraMatrix, viewMatrix };
  }

  static worldMatrix(
    rotation: Vector = new Vector(0, 0, 0),
    translation: Vector = new Vector(0, 0, 0)
  ) {
    const xRotation = Matrix.xRotation(rotation.x);
    // TODO: Quaternions?
    const yRotation = Matrix.yRotation(rotation.y);
    const zRotation = Matrix.zRotation(rotation.z);
    const _translation = Matrix.translation(translation);

    return _translation.mult(xRotation.mult(yRotation.mult(zRotation)));
  }

  static projectionMatrix(
    canvas: HTMLCanvasElement,
    nearPlane: number,
    farPlane: number,
    fieldOfViewDegrees: number
  ) {
    const aspectRatio = canvas.height / canvas.width;
    const projectionMatrix = Matrix.identity(4);

    const fieldOfViewRadians =
      1 / Math.tan(0.5 * fieldOfViewDegrees * (3.14 / 180));
    const fx = fieldOfViewRadians;
    const fy = fieldOfViewRadians;
    const fz = farPlane / (farPlane - nearPlane);

    projectionMatrix._mat[0][0] = fx;
    projectionMatrix._mat[1][1] = fy;
    projectionMatrix._mat[2][2] = fz;

    return {
      projectionMatrix,
      zOffset: (farPlane * nearPlane) / (farPlane - nearPlane),
    };
  }

  static identity(size: number) {
    const matrix = new Matrix(size, size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i !== j) continue;
        matrix._mat[i][j] = 1;
      }
    }

    return matrix;
  }

  static xRotation(angle: number) {
    const rad = (angle * Math.PI) / 180,
      c = Math.cos(rad),
      s = Math.sin(rad);

    const matrix = Matrix.identity(4);
    matrix.mat[0][0] = 1;
    matrix.mat[1][1] = c;
    matrix.mat[2][2] = c;
    matrix.mat[1][2] = -s;
    matrix.mat[2][1] = s;

    return matrix;
  }

  static yRotation(angle: number) {
    const rad = (angle * Math.PI) / 180,
      c = Math.cos(rad),
      s = Math.sin(rad);

    const matrix = Matrix.identity(4);
    matrix.mat[0][0] = c;
    matrix.mat[1][1] = 1;
    matrix.mat[2][2] = c;
    matrix.mat[2][0] = -s;
    matrix.mat[0][2] = s;

    return matrix;
  }

  static zRotation(angle: number) {
    const rad = (angle * Math.PI) / 180,
      c = Math.cos(rad),
      s = Math.sin(rad);

    const matrix = Matrix.identity(4);
    matrix.mat[0][0] = c;
    matrix.mat[1][1] = c;
    matrix.mat[2][2] = 1;
    matrix.mat[1][0] = s;
    matrix.mat[0][1] = -s;

    return matrix;
  }

  static translation(distance: Vector) {
    const matrix = Matrix.identity(4);

    matrix._mat[0][3] = distance.x;
    matrix._mat[1][3] = distance.y;
    matrix._mat[2][3] = distance.z;

    return matrix;
  }

  mult(matrix: Matrix) {
    if (this.cols !== matrix.rows)
      throw new Error(
        `Cannot perform matrix multiplication. This matrix has number of columns: ${this.cols}, input matrix has number of rows: ${matrix.rows}`
      );

    let newMat = new Matrix(this.rows, matrix._mat[0].length);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        newMat._mat[i][j] = 0;
        for (let k = 0; k < this.cols; k++) {
          newMat._mat[i][j] += this._mat[i][k] * matrix._mat[k][j];
        }
      }
    }

    return newMat;
  }

  equals(matrix: Matrix) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this._mat[i][j] !== matrix._mat[i][j]) return false;
      }
    }
    return true;
  }

  get mat() {
    return this._mat;
  }

  get isColumnVector() {
    return this.cols === 1;
  }

  get isRowVector() {
    return this.rows === 1;
  }

  get vector() {
    if (!this.isColumnVector && !this.isRowVector) {
      throw new Error(
        `Cannot convert matrix to vector, must be either a column or row vector`
      );
    }
    const components: number[] = [];

    if (this.isColumnVector) {
      this._mat.forEach((row) => components.push(row[0]));
    } else if (this.isRowVector) {
      this._mat[0].forEach((col) => components.push(col));
    }

    return new Vector(...components);
  }

  set mat(mat: number[][]) {
    if (mat.length !== this.rows) {
      throw new Error(
        `Cannot set Matrix as new rows is of length ${mat.length} but Matrix rows is ${this.rows}`
      );
    }

    mat.forEach((row) => {
      if (row.length !== this.cols) {
        throw new Error(
          `Cannot set Matrix as new columns is of length ${row.length} but Matrix rows is ${this.cols}`
        );
      }
    });

    this._mat = mat;
  }
}
