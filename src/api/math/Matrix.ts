import { Vector } from './Vector';

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

  static getProjectionMatrix(
    canvas: HTMLCanvasElement,
    nearPlane: number,
    farPlane: number,
    fieldOfViewDegrees: number
  ) {
    const aspectRatio = canvas.height / canvas.width;
    const projectionMatrix = new Matrix(3, 3);

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

  mult(matrix: Matrix) {
    if (this.cols !== matrix.rows)
      throw new Error(
        `Cannot perform matrix multiplication. This matrix as number of columns: ${this.cols}, input matrix has number of rows: ${matrix.rows}`
      );

    let newMat = new Matrix(this.rows, matrix._mat[0].length);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        let coeff = 0;
        for (let k = 0; k < this.cols; k++) {
          coeff += this._mat[i][k] * matrix._mat[k][j];
        }

        newMat._mat[i][j] = coeff;
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
