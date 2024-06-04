import { ZodError } from 'zod';
import { zBooleanStrictCoerce } from './z-boolean-strict-coerce';

describe('zBooleanStrictCoerce', () => {
  describe('when parsing a value with zBooleanStrictCoerce', () => {
    describe('when the provided value can be coerced to a boolean', () => {
      it.each(getSuccessTestCases())('should return $result when the provided value is $description', ({ value, result }) => {
        expect(zBooleanStrictCoerce.parse(value)).toBe(result);
      });
    });

    describe('when the provided value cannot be coerced to a boolean', () => {
      it.each(getFailureTestCases())('should throw an error when the provided value is $description', ({ value }) => {
        expect(() => zBooleanStrictCoerce.parse(value)).toThrow(ZodError);
      });
    });
  });

  describe('when parsing a value with zBooleanStrictCoerce and additional chaining', () => {
    describe('when chaining with .optional()', () => {
      it('should return undefined when the provided value is undefined', () => {
        expect(zBooleanStrictCoerce.optional().parse(undefined)).toBe(undefined);
      });
    });

    describe('when chaining with .nullable()', () => {
      it('should return null when the provided value is null', () => {
        expect(zBooleanStrictCoerce.nullable().parse(null)).toBe(null);
      });
    });
  });

  function getSuccessTestCases() {
    return [
      { value: true, result: true, description: 'true' },
      { value: false, result: false, description: 'false' },
      { value: 'true', result: true, description: '"true"' },
      { value: 'false', result: false, description: '"false"' },
      { value: 'TRUE', result: true, description: '"TRUE"' },
      { value: 'FALSE', result: false, description: '"FALSE"' },
      { value: 'True', result: true, description: '"True"' },
      { value: 'False', result: false, description: '"False"' },
      { value: '1', result: true, description: '"1"' },
      { value: '0', result: false, description: '"0"' },
      { value: 1, result: true, description: '1' },
      { value: 0, result: false, description: '0' },
    ];
  }

  function getFailureTestCases() {
    return [
      { value: '', description: 'should throw an error when value is an empty string' },
      { value: undefined, description: 'should throw an error when value is undefined' },
      { value: null, description: 'should throw an error when value is null' },
      { value: {}, description: 'should throw an error when value is an object' },
      { value: 'random', description: 'should throw an error when value is a non boolean string' },
      { value: 2, description: 'should throw an error when value is a non boolean number' },
    ];
  }
});
