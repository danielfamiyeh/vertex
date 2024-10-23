import assert from 'assert';

import { Sphere } from '../../src/api/math/sphere/Sphere';
import { Vector } from '../../src/api/math/vector/Vector';

describe('Sphere test suite', () => {
  it('should detect sphere collisions', () => {
    const s1 = new Sphere(new Vector(0, 0, 0), 1);
    const s2 = new Sphere(new Vector(2, 1, 1), 1);
    const s3 = new Sphere(new Vector(0.5, 0.5, 0.5), 1);

    assert.equal(s1.isIntersectingSphere(s2), false);
    assert.equal(s1.isIntersectingSphere(s3), true);
    assert.equal(s2.isIntersectingSphere(s3), true);
  });
});
