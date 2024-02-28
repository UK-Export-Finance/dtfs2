import { InvalidEntityTypeError } from '../errors';
import { getNumberTypeId } from './number-generator.controller';

describe('getNumberTypeId', () => {
  describe('Happy paths', () => {
    it.each`
      value         | expected
      ${'deal'}     | ${1}
      ${'facility'} | ${1}
    `('returns $expected when the value provided is $value', ({ value, expected }: { value: string; expected: number }) => {
      expect(getNumberTypeId(value)).toEqual(expected);
    });
  });

  describe('Unhappy paths', () => {
    it('throws an error of type $expected when the value provided is `term`', () => {
      expect(() => getNumberTypeId('term')).toThrow(InvalidEntityTypeError);
    });
  });
});
