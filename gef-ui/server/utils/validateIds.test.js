const { isValidCompaniesHouseNumber } = require('./validateIds');
const { COMPANIES_HOUSE_NUMBER } = require('../test-mocks/companies-house-number');

const {
  VALID, VALID_LAST_LETTER, VALID_LETTERS, VALID_LETTERS_NI, INVALID_SHORT, INVALID_SPACE, INVALID_SPECIAL_CHARACTER,
} = COMPANIES_HOUSE_NUMBER;

describe('validateIds', () => {
  describe('isValidCompaniesHouseNumber', () => {
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
});
