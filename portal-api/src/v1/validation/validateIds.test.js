const {
  isValidMongoId,
  isValidRegex,
  isValidCurrencyCode,
  isValidCompaniesHouseNumber,
  isValidMonth,
  isValidYear 
} = require('./validateIds');
const { COMPANIES_HOUSE_NUMBER } = require('../../../api-tests/fixtures/companies-house-number');

const { VALID, VALID_LAST_LETTER, VALID_LETTERS, VALID_LETTERS_NI, INVALID_SHORT, INVALID_SPECIAL_CHARACTER, INVALID_SPACE } = COMPANIES_HOUSE_NUMBER;

describe('validateIds', () => {
  describe('isValidMongoId', () => {
    it('should return false if an id is not provided', () => {
      const result = isValidMongoId();

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId('12345');

      expect(result).toEqual(false);
    });

    it('should return true if an id is a valid mongo id', () => {
      const result = isValidMongoId('620a1aa095a618b12da38c7b');

      expect(result).toEqual(true);
    });
  });

  describe('isValidRegex', () => {
    const regex = /^[0-9]*$/;

    it('should return false if input does not match regex', () => {
      const result = isValidRegex(regex, 'A');

      expect(result).toEqual(false);
    });

    it('should return true if input matches regex', () => {
      const result = isValidRegex(regex, '123');

      expect(result).toEqual(true);
    });
  });

  describe('isValidCurrencyCode', () => {
    it('should return false if input is not a currency code', () => {
      const result = isValidCurrencyCode('AAA');

      expect(result).toEqual(false);
    });

    it('should return true if input is a valid currency code', () => {
      const result = isValidCurrencyCode('GBP');

      expect(result).toEqual(true);
    });
  });

  describe('companiesHouseNumberRegex', () => {
    it(`should return true for company number ${VALID}`, () => {
      const result = isValidCompaniesHouseNumber(VALID);

      expect(result).toEqual(true);
    });

    it(`should return true for company number ${VALID_LETTERS}`, () => {
      const result = isValidCompaniesHouseNumber(VALID_LETTERS);

      expect(result).toEqual(true);
    });

    it(`should return true for company number ${VALID_LAST_LETTER}`, () => {
      const result = isValidCompaniesHouseNumber(VALID_LAST_LETTER);

      expect(result).toEqual(true);
    });

    it(`should return true for company number ${VALID_LETTERS_NI}`, () => {
      const result = isValidCompaniesHouseNumber(VALID_LETTERS_NI);

      expect(result).toEqual(true);
    });

    it('should return false for company number which is too short', () => {
      const result = isValidCompaniesHouseNumber(INVALID_SHORT);

      expect(result).toEqual(false);
    });

    it('should return false for company number which has a special character', () => {
      const result = isValidCompaniesHouseNumber(INVALID_SPECIAL_CHARACTER);

      expect(result).toEqual(false);
    });

    it('should return false for company number which has a special character', () => {
      const result = isValidCompaniesHouseNumber(INVALID_SPACE);

      expect(result).toEqual(false);
    });
  });

  describe('isValidMonth', () => {
    it('should return true for a valid month', () => {
      const result = isValidMonth(6);

      expect(result).toEqual(true);
    });

    it('should return false for a non-integer', () => {
      const result = isValidMonth(6.13);

      expect(result).toEqual(false);
    });

    it('should return false for an integer over 12', () => {
      const result = isValidMonth(13);

      expect(result).toEqual(false);
    });

    it('should return false for 0', () => {
      const result = isValidMonth(0);

      expect(result).toEqual(false);
    });

    it('should return false for null', () => {
      const result = isValidMonth(null);

      expect(result).toEqual(false);
    });

    it('should return false for a string representing url traversal', () => {
      const result = isValidMonth('../../../etc/passwd');

      expect(result).toEqual(false);
    });
  });

  describe('isValidYear', () => {
    it('should return true for a valid year', () => {
      const result = isValidYear(2023);

      expect(result).toEqual(true);
    });

    it('should return false for a non-integer', () => {
      const result = isValidYear(2023.1);

      expect(result).toEqual(false);
    });

    it('should return false for an integer over 2100', () => {
      const result = isValidYear(3045);

      expect(result).toEqual(false);
    });

    it('should return false for before 2000', () => {
      const result = isValidYear(1995);

      expect(result).toEqual(false);
    });

    it('should return false for null', () => {
      const result = isValidYear(null);

      expect(result).toEqual(false);
    });

    it('should return false for a string representing url traversal', () => {
      const result = isValidYear('../../../etc/passwd');

      expect(result).toEqual(false);
    });
  });
});
