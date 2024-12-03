import { isNonEmptyString, isNullUndefinedOrEmptyString, isString } from './string';

describe('string helpers', () => {
  describe('isString', () => {
    it.each`
      value                                 | expected
      ${1}                                  | ${false}
      ${true}                               | ${false}
      ${null}                               | ${false}
      ${undefined}                          | ${false}
      ${['a string in an array']}           | ${false}
      ${{ value: 'a string in an object' }} | ${false}
      ${''}                                 | ${true}
      ${'a string'}                         | ${true}
    `('returns $expected when the value is $value', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(isString(value)).toEqual(expected);
    });
  });

  describe('isNullUndefinedOrEmptyString', () => {
    it.each`
      value        | expected
      ${null}      | ${true}
      ${undefined} | ${true}
      ${''}        | ${true}
      ${' '}       | ${true}
      ${'string'}  | ${false}
      ${' string'} | ${false}
      ${'string '} | ${false}
    `('returns $expected when the value is $value', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(isNullUndefinedOrEmptyString(value)).toEqual(expected);
    });
  });

  describe('isNonEmptyString', () => {
    it.each`
      value        | expected
      ${null}      | ${false}
      ${undefined} | ${false}
      ${''}        | ${false}
      ${' '}       | ${false}
      ${'string'}  | ${true}
      ${' string'} | ${true}
      ${'string '} | ${true}
    `('returns $expected when the value is $value', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(isNonEmptyString(value)).toEqual(expected);
    });
  });
});
