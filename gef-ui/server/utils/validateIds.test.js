const { isValidMongoId, isValidCompaniesHouseNumber, isValidUkPostcode } = require('./validateIds');
const { COMPANIES_HOUSE_NUMBER } = require('../test-mocks/companies-house-number');

const { VALID, VALID_LAST_LETTER, VALID_LETTERS, VALID_LETTERS_NI, INVALID_SHORT, INVALID_SPACE, INVALID_SPECIAL_CHARACTER } = COMPANIES_HOUSE_NUMBER;

describe('validateIds', () => {
  describe('isValidMongoId', () => {
    it('should return true if an id is a valid mongo id', () => {
      const result = isValidMongoId('620a1aa095a618b12da38c7b');

      expect(result).toEqual(true);
    });

    it('should return false if an id is not provided', () => {
      const result = isValidMongoId();

      expect(result).toEqual(false);
    });

    const invalidMongoIds = ['12345', '127.0.0.1', '../../etc', {}, []];
    test.each(invalidMongoIds)('should return false if an id is not a valid mongo id', (invalidMongoId) => {
      const result = isValidMongoId(invalidMongoId);

      expect(result).toEqual(false);
    });
  });

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

  describe('isValidPostcode', () => {
    it('should return true if an id is a valid UK postcode', () => {
      const result = isValidUkPostcode('SW1A 2AA');

      expect(result).toEqual(true);
    });

    const invalidPostcodes = ['12345', '127.0.0.1', '../../etc', '{}', '[]'];
    test.each(invalidPostcodes)('should return false if an id is not a valid postcode', (invalidPostcode) => {
      const result = isValidUkPostcode(invalidPostcode);

      expect(result).toEqual(false);
    });
  });
});
