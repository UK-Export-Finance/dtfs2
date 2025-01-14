import { asString, isMonetaryAmountValid, isPaymentReferenceOverMaxCharacterCount, isValidCompanyRegistrationNumber } from './validation';
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
      expect(typeof stringValue).toEqual('string');
      expect(stringValue).toEqual(value);
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

  describe('isPaymentReferenceOverMaxCharacterCount', () => {
    describe('when payment reference is over 50 characters', () => {
      it('should return true', () => {
        const longReference = 'a'.repeat(51);
        const result = isPaymentReferenceOverMaxCharacterCount(longReference);

        expect(result).toEqual(true);
      });
    });

    describe('when payment reference is exactly 50 characters', () => {
      it('should return false', () => {
        const fiftyCharReference = 'a'.repeat(50);
        const result = isPaymentReferenceOverMaxCharacterCount(fiftyCharReference);

        expect(result).toEqual(false);
      });
    });

    describe('when payment reference is under 50 characters', () => {
      it('should return false', () => {
        const shortReference = 'a'.repeat(49);
        const result = isPaymentReferenceOverMaxCharacterCount(shortReference);

        expect(result).toEqual(false);
      });
    });

    describe('when payment reference is empty', () => {
      it('should return false', () => {
        const result = isPaymentReferenceOverMaxCharacterCount('');

        expect(result).toEqual(false);
      });
    });

    describe('when payment reference is exactly 51 characters', () => {
      it('should return true', () => {
        const fiftyOneCharReference = 'a'.repeat(51);
        const result = isPaymentReferenceOverMaxCharacterCount(fiftyOneCharReference);

        expect(result).toEqual(true);
      });
    });
  });

  describe('isMonetaryAmountValid', () => {
    describe('when monetary amount is valid', () => {
      it('should return true for whole numbers', () => {
        expect(isMonetaryAmountValid('100')).toEqual(true);
      });

      it('should return true for decimal numbers', () => {
        expect(isMonetaryAmountValid('100.00')).toEqual(true);
      });

      it('should return true for numbers with thousands separators', () => {
        expect(isMonetaryAmountValid('1,000.00')).toEqual(true);
        expect(isMonetaryAmountValid('1,000,000.00')).toEqual(true);
      });
    });

    describe('when monetary amount is invalid', () => {
      it('should return false for undefined', () => {
        expect(isMonetaryAmountValid(undefined)).toEqual(false);
      });

      it('should return false for empty string', () => {
        expect(isMonetaryAmountValid('')).toEqual(false);
      });

      it('should return false for invalid number formats', () => {
        expect(isMonetaryAmountValid('abc')).toEqual(false);
        expect(isMonetaryAmountValid('100.000')).toEqual(false);
        expect(isMonetaryAmountValid('1,00.00')).toEqual(false);
        expect(isMonetaryAmountValid('1.000,00')).toEqual(false);
      });

      it('should return false for numbers with invalid thousands separator placement', () => {
        expect(isMonetaryAmountValid('1,00')).toEqual(false);
        expect(isMonetaryAmountValid('1,000,00')).toEqual(false);
      });
    });
  });
});
