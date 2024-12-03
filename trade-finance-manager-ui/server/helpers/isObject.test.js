import isObject from './isObject.helper';

describe('isObject()', () => {
  it('returns the correct boolean', () => {
    expect(isObject({})).toBeTruthy();
    expect(isObject({ foo: 'bar' })).toBeTruthy();
    expect(isObject([])).toBeFalsy();
    expect(isObject('')).toBeFalsy();
    expect(isObject(1)).toBeFalsy();
    expect(isObject(true)).toBeFalsy();
    expect(isObject(false)).toBeFalsy();
  });
});
