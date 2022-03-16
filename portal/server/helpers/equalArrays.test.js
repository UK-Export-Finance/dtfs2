import { equalArrays } from './equalArrays.helper';

describe('equalArrays', () => {
  it('should return `true` when both arrays are the same', () => {
    const array1 = ['abc'];
    const array2 = ['abc'];
    expect(equalArrays(array1, array2)).toEqual(true);
  });

  it('should return `true` when both arrays are empty', () => {
    const array1 = [];
    const array2 = [];
    expect(equalArrays(array1, array2)).toEqual(true);
  });

  it('should return `false` when one of the arrays has more items', () => {
    const array1 = ['abc'];
    const array2 = ['abc', 'def'];
    expect(equalArrays(array1, array2)).toEqual(false);
  });
  it('should return `false` when the array length is the same but the items are different', () => {
    const array1 = ['abc', 'dee'];
    const array2 = ['abc', 'def'];
    expect(equalArrays(array1, array2)).toEqual(false);
  });

  it('should return `false` when one array is empty', () => {
    const array1 = [];
    const array2 = ['abc', 'def'];
    expect(equalArrays(array1, array2)).toEqual(false);
  });
});
