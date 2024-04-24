import { asString } from './validation';

describe('validation helpers', () => {
  describe('asString', () => {
    it.each`
      value
      ${''}
      ${'a string'}
    `('returns the value when given string: "$value"', ({ value }: { value: string }) => {
      // Act
      const stringValue = asString(value, 'value');

      // Assert
      expect(typeof stringValue).toBe('string');
      expect(stringValue).toBe(value);
    });

    it.each`
      invalidValue                          | expectedError
      ${1}                                  | ${'Expected value to be a string'}
      ${true}                               | ${'Expected value to be a string'}
      ${null}                               | ${'Expected value to be a string'}
      ${undefined}                          | ${'Expected value to be a string'}
      ${['a string in an array']}           | ${'Expected value to be a string'}
      ${{ value: 'a string in an object' }} | ${'Expected value to be a string'}
    `(
      'throws when given non-string value: $invalidValue',
      ({ invalidValue, expectedError }: { invalidValue: unknown; expectedError: string }) => {
        expect(() => asString(invalidValue, 'value')).toThrow(expectedError);
      },
    );
  });
});
