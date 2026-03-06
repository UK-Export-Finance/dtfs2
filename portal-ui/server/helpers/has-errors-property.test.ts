import { hasErrorsProperty } from './has-errors-property';

describe('hasErrorsProperty', () => {
  it('returns true for object with errors array', () => {
    const obj = { errors: [{ msg: 'expired' }] };
    expect(hasErrorsProperty(obj)).toBe(true);
  });

  it('returns true for object with errors undefined', () => {
    const obj = { errors: undefined };
    expect(hasErrorsProperty(obj)).toBe(true);
  });

  it('returns false for null, arrays, and primitives', () => {
    expect(hasErrorsProperty(null)).toBe(false);
    expect(hasErrorsProperty([])).toBe(false);
    expect(hasErrorsProperty('string')).toBe(false);
    expect(hasErrorsProperty(123)).toBe(false);
  });
});
