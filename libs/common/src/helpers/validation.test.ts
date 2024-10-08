import { asString, isValidCompanyRegistrationNumber } from './validation';
import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '..';

const {
  VALID,
  VALID_WITH_LETTERS,
  VALID_ENDS_WITH_LETTER,
  VALID_WITH_NI_PREFIX,
  VALID_NONEXISTENT,
  VALID_OVERSEAS,
  INVALID_TOO_SHORT,
  INVALID_TOO_LONG,
  INVALID_WITH_SPACE,
  INVALID_WITH_SPECIAL_CHARACTER,
} = MOCK_COMPANY_REGISTRATION_NUMBERS;

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
    `('throws when given non-string value: $invalidValue', ({ invalidValue, expectedError }: { invalidValue: unknown; expectedError: string }) => {
      expect(() => asString(invalidValue, 'value')).toThrow(expectedError);
    });
  });

  describe('isValidCompanyRegistrationNumber', () => {
    it(`should return true for company number ${VALID}`, () => {
      const result = isValidCompanyRegistrationNumber(VALID);

      expect(result).toEqual(true);
    });

    it(`should return true for company number ${VALID_WITH_LETTERS}, which contains letters`, () => {
      const result = isValidCompanyRegistrationNumber(VALID_WITH_LETTERS);

      expect(result).toEqual(true);
    });

    it(`should return true for company number ${VALID_ENDS_WITH_LETTER}, which ends in a letter`, () => {
      const result = isValidCompanyRegistrationNumber(VALID_ENDS_WITH_LETTER);

      expect(result).toEqual(true);
    });

    it(`should return true for company number ${VALID_WITH_NI_PREFIX}, which contains the prefix 'NI'`, () => {
      const result = isValidCompanyRegistrationNumber(VALID_WITH_NI_PREFIX);

      expect(result).toEqual(true);
    });

    it(`should return true for company number ${VALID_NONEXISTENT}, which is for a non-existent company but is in the correct format`, () => {
      const result = isValidCompanyRegistrationNumber(VALID_NONEXISTENT);

      expect(result).toEqual(true);
    });

    it(`should return true for company number ${VALID_OVERSEAS}, which is for an overseas company`, () => {
      const result = isValidCompanyRegistrationNumber(VALID_OVERSEAS);

      expect(result).toEqual(true);
    });

    it(`should return false for company number ${INVALID_TOO_SHORT}, which is too short`, () => {
      const result = isValidCompanyRegistrationNumber(INVALID_TOO_SHORT);

      expect(result).toEqual(false);
    });

    it(`should return false for company number ${INVALID_TOO_LONG}, which is too long`, () => {
      const result = isValidCompanyRegistrationNumber(INVALID_TOO_LONG);

      expect(result).toEqual(false);
    });

    it(`should return false for company number ${INVALID_WITH_SPECIAL_CHARACTER}, which has a special character`, () => {
      const result = isValidCompanyRegistrationNumber(INVALID_WITH_SPECIAL_CHARACTER);

      expect(result).toEqual(false);
    });

    it(`should return false for company number ${INVALID_WITH_SPACE}, which has a space`, () => {
      const result = isValidCompanyRegistrationNumber(INVALID_WITH_SPACE);

      expect(result).toEqual(false);
    });
  });
});
