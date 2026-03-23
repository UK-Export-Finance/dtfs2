import { isApiErrorResponse } from './is-api-error-response';

describe('isApiErrorResponse', () => {
  it('should return true for object with errors array', () => {
    const obj = { errors: [{ msg: 'expired' }] };

    expect(isApiErrorResponse(obj)).toEqual(true);
  });

  it('should return true for object with errors undefined', () => {
    const obj = { errors: undefined };

    expect(isApiErrorResponse(obj)).toEqual(true);
  });

  it.each([[null], [[]], ['string'], [123]])('should return false for non-object input %p', (input) => {
    expect(isApiErrorResponse(input as any)).toEqual(false);
  });
});
