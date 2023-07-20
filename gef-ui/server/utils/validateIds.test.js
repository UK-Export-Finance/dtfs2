const { isValidRegex } = require('./validateIds');
const { COMPANIES_HOUSE_NUMBER_REGEX } = require('../constants');

describe('validateIds', () => {
  describe('isValidRegex', () => {
    it('should return true for company number 8989898', () => {
      const result = isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, '8989898');

      expect(result).toEqual(true);
    });

    it('should return true for company number SC907816', () => {
      const result = isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, 'SC907816');

      expect(result).toEqual(true);
    });

    it('should return true for company number RS00592C', () => {
      const result = isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, 'RS00592C');

      expect(result).toEqual(true);
    });

    it('should return true for company number NI614169', () => {
      const result = isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, 'NI614169');

      expect(result).toEqual(true);
    });

    it('should return false for company number which is too short', () => {
      const result = isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, '898889');

      expect(result).toEqual(false);
    });

    it('should return false for company number which has a special character', () => {
      const result = isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, 'R$00592C');

      expect(result).toEqual(false);
    });

    it('should return false for company number which has a special character', () => {
      const result = isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, '8989898 ');

      expect(result).toEqual(false);
    });
  });
});
