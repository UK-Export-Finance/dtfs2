const { isValidMongoId, isValidUkPostcode } = require('./validateIds');

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
