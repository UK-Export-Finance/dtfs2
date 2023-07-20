const { isValidMongoId, isValidRegex, isValidCurrencyCode } = require('../../../src/v1/validation/validateIds');
const { COMPANIES_HOUSE_NUMBER } = require('../../../src/constants/regex');

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

    describe('companiesHouseNumberRegex', () => {
      it('should return true for company number 8989898', () => {
        const result = isValidRegex(COMPANIES_HOUSE_NUMBER, '8989898');

        expect(result).toEqual(true);
      });

      it('should return true for company number SC907816', () => {
        const result = isValidRegex(COMPANIES_HOUSE_NUMBER, 'SC907816');

        expect(result).toEqual(true);
      });

      it('should return true for company number RS00592C', () => {
        const result = isValidRegex(COMPANIES_HOUSE_NUMBER, 'RS00592C');

        expect(result).toEqual(true);
      });

      it('should return true for company number NI614169', () => {
        const result = isValidRegex(COMPANIES_HOUSE_NUMBER, 'NI614169');

        expect(result).toEqual(true);
      });

      it('should return false for company number which is too short', () => {
        const result = isValidRegex(COMPANIES_HOUSE_NUMBER, '898889');

        expect(result).toEqual(false);
      });

      it('should return false for company number which has a special character', () => {
        const result = isValidRegex(COMPANIES_HOUSE_NUMBER, 'R$00592C');

        expect(result).toEqual(false);
      });

      it('should return false for company number which has a special character', () => {
        const result = isValidRegex(COMPANIES_HOUSE_NUMBER, '8989898 ');

        expect(result).toEqual(false);
      });
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
});
