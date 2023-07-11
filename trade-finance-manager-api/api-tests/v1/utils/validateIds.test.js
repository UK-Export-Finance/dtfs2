const { 
  isValidMongoId,
  isValidUkefNumericId,
  isValidPartyUrn,
  isValidNumericId,
  isValidCurrencyCode
} = require('../../../src/v1/validation/validateIds');

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

  describe('isValidPartyUrn', () => {
    it('should return false if a URN is not provided', () => {
      const result = isValidPartyUrn();

      expect(result).toEqual(false);
    });

    it('should return false if an party URN is not a valid URN', () => {
      const result = isValidPartyUrn('12345');

      expect(result).toEqual(false);
    });

    it('should return true if the party URN is a valid URN', () => {
      const result = isValidPartyUrn('00364783');

      expect(result).toEqual(true);
    });
  });

  describe('isValidUkefNumericId', () => {
    it('should return false if an id is not provided', () => {
      const result = isValidUkefNumericId();

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid UKEF id', () => {
      const result = isValidUkefNumericId('12345');

      expect(result).toEqual(false);
    });

    it('should return true if an id is a valid UKEF id', () => {
      const result = isValidUkefNumericId('0036478312');

      expect(result).toEqual(true);
    });
  });

  describe('isValidNumericId', () => {
    it('should return false if a URN is not provided', () => {
      const result = isValidNumericId();

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid numeric id', () => {
      const result = isValidNumericId('abc');

      expect(result).toEqual(false);
    });

    it('should return true if an id is a valid numeric id', () => {
      const result = isValidNumericId('00364783');

      expect(result).toEqual(true);
    });
  });

  describe('isValidCurrencyCode', () => {
    it('should return false if a currency code is not provided', () => {
      const result = isValidCurrencyCode();

      expect(result).toEqual(false);
    });

    it('should return false if a code is not a valid currency code', () => {
      const result = isValidCurrencyCode('12345');

      expect(result).toEqual(false);
    });

    it('should return true if a code is a valid currency code', () => {
      const result = isValidCurrencyCode('USD');

      expect(result).toEqual(true);
    });
  });
});
