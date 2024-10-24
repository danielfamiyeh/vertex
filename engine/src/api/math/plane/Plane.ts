import { Vector } from '../vector/Vector';

export class Plane {
  private _d: number;

  constructor(private _point: Vector, private _normal: Vector) {
    this._d = _point.dot(this.normal);
  }

  /**
   * Generates a Plane object from three position vectors
   *
   * @param {Vector} p    Arbitrary point to be used as a reference
   * @param {Vector} q    Destination point used to construct a vector in the plane
   * @param {Vector} r    Destination point used to construct a vector in the plane
   * @returns {Plane}     Plane constructed from three position vectors
   */
  static fromPoints(p: Vector, q: Vector, r: Vector): Plane {
    const position = p.copy();
    const pq = q.copy().sub(p);
    const pr = r.copy().sub(p);

    const normal = pq.cross(pr);

    return new Plane(position, normal);
  }

  /**

  /**
   * Finds the point at which a ray intersects a plane
   *
   * @param {Vector} startPoint   Start coordinate of ray
   * @param {Vector} endPoint     End coordiante of ray
   * @param {number} epsilon      Margin of error
   * @returns {Vector | null}     Returns Vector if ray intersects plane, else null
   */
  intersectRay(
    startPoint: Vector,
    endPoint: Vector,
    epsilon: number = 1e-6
  ): Vector | null {
    let ray = endPoint.sub(startPoint);
    const dot = this.normal.dot(ray);

    if (Math.abs(dot) > epsilon) {
      const w = startPoint.copy().sub(this.point);
      const fac = -this.normal.dot(w) / dot;
      ray = ray.scale(fac);

      return startPoint.copy().add(ray);
    }

    return null;
  }

  /**
   * Determines a points distance from closest point of a plane
   *
   * @param {Vector} point Position vector representing a point in 3D space
   * @returns {number}     Distance from plane in arbitrary units
   */
  pointDistance(point: Vector): number {
    return (this.normal.dot(point) + this.d) / this.normal.mag;
  }

  /**
   * Clips triangles against plane
   *
   * @param {Triangle} input      Triangle to clip against plane
   * @returns {Array<Triangle>}   Array of triangles produced by clipping input
   */
  clipTriangle(input: Vector[]): Vector[][] {
    const newTriangles: Array<Vector[]> = [];
    const points: { inside: Array<Vector>; outside: Array<Vector> } = {
      inside: [],
      outside: [],
    };

    const distances = input.map((point) => this.pointDistance(point));

    distances.forEach((dist, i) => {
      points[dist >= 0 ? 'inside' : 'outside'].push(input[i]);
    });

    switch (points.inside.length) {
      case 1: {
        // Clip triangle against ray of intersection
        const newTriangle = input.map((point) => point.copy());

        // Preserve inside point
        newTriangle[0] = points.inside[0];

        // Get new points based on ray intersection from preserved point and plane
        points.outside.forEach((point) =>
          this.intersectRay(newTriangle[0], point)
        );
        break;
      }

      case 2: {
        /**
         * Two points lie inside plane so clip triangle against plane
         * Split quad formed by clipping into two triangles
         */
        const newTriangle1 = input.map((point) => point.copy());
        const newTriangle2 = input.map((point) => point.copy());

        // First triangle has two inside points and one at plane intersection
        newTriangle1[0] = points.inside[0];
        newTriangle1[1] = points.inside[1];
        newTriangle1[2] = this.intersectRay(
          points.inside[0],
          points.outside[0]
        ) as Vector;

        /**
         * Second triangle is defined by one inside point, the clipped point of the other triangle
         * and a new clipped point on the other side of the triangle
         */
        newTriangle2[0] = points.inside[1];
        newTriangle2[1] = newTriangle1[2];
        newTriangle2[2] = this.intersectRay(
          points.inside[1],
          points.outside[0]
        ) as Vector;
        break;
      }

      case 3: {
        newTriangles.push(input.map((point) => point.copy()));
        break;
      }
    }

    return newTriangles;
  }

  get point() {
    return this._point;
  }

  get normal() {
    return this._normal;
  }

  get d() {
    return this._d;
  }
}
