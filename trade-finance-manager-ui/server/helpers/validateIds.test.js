const { isValidMongoId, isValidPartyUrn } = require('./validateIds');

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

    it('should return false if provided an empty object', () => {
      const result = isValidMongoId({});

      expect(result).toEqual(false);
    });

    it('should return false if provided an empty array', () => {
      const result = isValidMongoId([]);

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

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidPartyUrn('12345');

      expect(result).toEqual(false);
    });

    it('should return false if provided an empty object', () => {
      const result = isValidPartyUrn({});

      expect(result).toEqual(false);
    });

    it('should return false if provided an empty array', () => {
      const result = isValidPartyUrn([]);

      expect(result).toEqual(false);
    });

    it('should return true if an id is a valid mongo id', () => {
      const result = isValidPartyUrn('00364783');

      expect(result).toEqual(true);
    });
  });
});
