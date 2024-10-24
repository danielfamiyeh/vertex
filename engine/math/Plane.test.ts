import assert from 'assert';

import { Plane } from '../../src/api/math/plane/Plane';
import { Vector } from '../../src/api/math/vector/Vector';

describe('Plane test suite', () => {
  let points: number[][] | Vector[] = [
    [1, -2, 0],
    [3, 1, 4],
    [0, -1, 2],
  ];

  points = points.map((p) => new Vector(...p));

  it('should return the point at which a ray intersects a plane', () => {
    const plane = Plane.fromPoints(
      <Vector>points[0],
      <Vector>points[1],
      <Vector>points[2]
    );
    let ray: number[][] | Vector[] = [
      [0.5, 1, 5],
      [1, 0, 1],
    ];
    ray = ray.map((point) => new Vector(...point));

    const pointOfIntersection = plane.intersectRay(ray[0], ray[1]);

    assert.equal(pointOfIntersection?.isEqual(new Vector(0.5, 1, 5)), true);
  });

  it('should return the signed distance from a given point', () => {
    const plane = Plane.fromPoints(
      <Vector>points[0],
      <Vector>points[1],
      <Vector>points[2]
    );
    const point = new Vector(5, 3, -1);
    const signedDistance = -0.10369516947304253;

    assert.equal(plane.pointDistance(point), signedDistance);
  });
});
