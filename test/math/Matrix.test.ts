import assert from 'assert';
import { Matrix } from '../../src/api/math/matrix/Matrix';

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

    const m3 = new Matrix(4, 4);
    const m4 = new Matrix(4, 1);
    const ans2 = new Matrix(4, 1);

    m3.mat = [
      [1, -2, -3, -6],
      [2, 1, -6, 3],
      [3, 6, 1, -2],
      [6, -3, 2, 1],
    ];

    m4.mat = [[0], [1], [0], [0]];

    ans2.mat = [[-2], [1], [6], [-3]];

    assert.equal(ans2.equals(m3.mult(m4)), true);
  });
});
