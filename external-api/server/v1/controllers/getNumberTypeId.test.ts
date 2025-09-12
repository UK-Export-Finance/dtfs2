import { InvalidEntityTypeError } from '../errors';
import { getNumberTypeId } from './number-generator.controller';
/**
 * Test suite for the getNumberTypeId function.
 *
 * The getNumberTypeId function takes a value representing an entity type and returns the corresponding number type ID.
 *
 * Happy paths:
 * - When the value provided is 'deal', the function should return 1.
 * - When the value provided is 'facility', the function should return 1.
 *
 * Unhappy paths:
 * - When the value provided is 'term', the function should throw an InvalidEntityTypeError exception.
 * - When the value provided is '123', the function should throw an InvalidEntityTypeError exception.
 * - When the value provided is '!"£', the function should throw an InvalidEntityTypeError exception.
 * - When the value provided is an empty string, the function should throw an InvalidEntityTypeError exception.
 * - When the value provided is an empty array, the function should throw an InvalidEntityTypeError exception.
 * - When the value provided is an empty object, the function should throw an InvalidEntityTypeError exception.
 * - When the value provided is null, the function should throw an InvalidEntityTypeError exception.
 * - When the value provided is undefined, the function should throw an InvalidEntityTypeError exception.
 */

describe('getNumberTypeId', () => {
  describe('Happy paths', () => {
    it.each`
      value         | expected
      ${'deal'}     | ${1}
      ${'facility'} | ${1}
    `('Returns $expected when the value provided is $value', ({ value, expected }: { value: string; expected: number }) => {
      expect(getNumberTypeId(value)).toEqual(expected);
    });
  });

  describe('Unhappy paths', () => {
    it.each`
      value
      ${'term'}
      ${'123'}
      ${'!"£'}
      ${''}
      ${[]}
      ${{}}
      ${null}
      ${undefined}
    `('Throws InvalidEntityTypeError exception when the value provided is $value', ({ value }: { value: string }) => {
      expect(() => getNumberTypeId(value)).toThrow(InvalidEntityTypeError);
    });
  });
});
