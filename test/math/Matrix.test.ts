import assert from 'assert';
import { Matrix } from '../../src/api/math/Matrix';

describe('Matrix test suite', () => {
  it('should multiply two matrices together', () => {
    const m1 = new Matrix(2, 3);
    const m2 = new Matrix(3, 2);
    const ans = new Matrix(2, 2);

    m1.mat = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    m2.mat = [
      [7, 8],
      [9, 10],
      [11, 12],
    ];
    ans.mat = [
      [58, 64],
      [139, 154],
    ];

    assert.equal(ans.equals(m1.mult(m2)), true);
  });
});
