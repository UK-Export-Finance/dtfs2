import removeEmptyStringsFromObject from './removeEmptyStringsFromObject';

describe('removeEmptyStringsFromObject', () => {
  it('should remove properties that are null or have empty string', () => {
    const mockObj = {
      a: true,
      b: 'test',
      c: '',
      d: null,
      e: false,
      f: {},
      g: [],
    };
    const result = removeEmptyStringsFromObject(mockObj);

    const expected = {
      a: true,
      b: 'test',
      d: null,
      e: false,
      f: {},
      g: [],
    };

    expect(result).toEqual(expected);
  });
});
