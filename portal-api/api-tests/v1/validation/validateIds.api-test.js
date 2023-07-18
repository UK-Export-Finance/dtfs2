const { isValidMongoId, isValidRegex, isValidCurrencyCode, isNotValidCompaniesHouseNumber } = require('../../../src/v1/validation/validateIds');

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

  describe('isNotValidCompaniesHouseNumber', () => {
    it('should return false if input is a valid companies house number', () => {
      const result = isNotValidCompaniesHouseNumber('8989898');

      expect(result).toEqual(false);
    });

    it('should return true if input not a valid companies house number with too many digits', () => {
      const result = isNotValidCompaniesHouseNumber('89898989999');

      expect(result).toEqual(true);
    });

    it('should return true if input not a valid companies house number with too few digits', () => {
      const result = isNotValidCompaniesHouseNumber('898');

      expect(result).toEqual(true);
    });
  });
});
