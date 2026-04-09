import { parseApiErrorResponse } from './parse-api-error-response';

describe('parseApiErrorResponse', () => {
  it('should return the object when it has an errors array', () => {
    const obj = { errors: [{ msg: 'expired' }] };

    expect(parseApiErrorResponse(obj)).toEqual(obj);
  });

  it('should return the object when errors is undefined', () => {
    const obj = { errors: undefined };

    expect(parseApiErrorResponse(obj)).toEqual(obj);
  });

  it.each([[null], [[]], ['string'], [123]])('should return undefined for non-object input %p', (input) => {
    expect(parseApiErrorResponse(input as any)).toBeUndefined();
  });
});
