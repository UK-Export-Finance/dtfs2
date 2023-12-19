import { asString } from './validation';

describe('validation helper', () => {
  describe('asString', () => {
    it.each`
      value
      ${''}
      ${'a string'}
    `('returns the value when given string: "$value"', ({ value }: { value: string }) => {
      // Act
      const stringValue = asString(value);

      // Assert
      expect(typeof stringValue).toBe('string');
      expect(stringValue).toBe(value);
    });

    it.each`
      invalidValue                          | context           | expected
      ${1}                                  | ${'CONFIG_VALUE'} | ${'Expected CONFIG_VALUE to be a string'}
      ${true}                               | ${undefined}      | ${'Expected value to be a string'}
      ${null}                               | ${'CONFIG_VALUE'} | ${'Expected CONFIG_VALUE to be a string'}
      ${undefined}                          | ${undefined}      | ${'Expected value to be a string'}
      ${['a string in an array']}           | ${'CONFIG_VALUE'} | ${'Expected CONFIG_VALUE to be a string'}
      ${{ value: 'a string in an object' }} | ${undefined}      | ${'Expected value to be a string'}
    `(
      'throws when given non-string value: $invalidValue',
      ({ invalidValue, context, expected }: { invalidValue: unknown; context?: string; expected: string }) => {
        // Assert
        expect(() => asString(invalidValue, context)).toThrow(expected);
      },
    );
  });
});
