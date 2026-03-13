import { isApiErrorResponse } from './is-api-error-response';

describe('isApiErrorResponse', () => {
  it('should return true for object with errors array', () => {
    const obj = { errors: [{ msg: 'expired' }] };
    expect(isApiErrorResponse(obj)).toBe(true);
  });

  it('should return true for object with errors undefined', () => {
    const obj = { errors: undefined };
    expect(isApiErrorResponse(obj)).toBe(true);
  });

  it('should return false for null, arrays, and primitives', () => {
    expect(isApiErrorResponse(null)).toBe(false);
    expect(isApiErrorResponse([])).toBe(false);
    expect(isApiErrorResponse('string')).toBe(false);
    expect(isApiErrorResponse(123)).toBe(false);
  });
});
