import { hasErrorsProperty } from './has-errors-property';

describe('hasErrorsProperty', () => {
  it('should return true for object with errors array', () => {
    const obj = { errors: [{ msg: 'expired' }] };
    expect(hasErrorsProperty(obj)).toBe(true);
  });

  it('should return true for object with errors undefined', () => {
    const obj = { errors: undefined };
    expect(hasErrorsProperty(obj)).toBe(true);
  });

  it('should return false for null, arrays, and primitives', () => {
    expect(hasErrorsProperty(null)).toBe(false);
    expect(hasErrorsProperty([])).toBe(false);
    expect(hasErrorsProperty('string')).toBe(false);
    expect(hasErrorsProperty(123)).toBe(false);
  });
});
