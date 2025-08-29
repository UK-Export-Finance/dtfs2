import isObject from './isObject';

describe('isObject()', () => {
  it('returns the correct boolean', () => {
    expect(isObject({})).toEqual(true);
    expect(isObject({ foo: 'bar' })).toEqual(true);
    expect(isObject([])).toEqual(false);
    expect(isObject('')).toEqual(false);
    expect(isObject(1)).toEqual(false);
    expect(isObject(true)).toEqual(false);
    expect(isObject(false)).toEqual(false);
  });
});
