const {
  isValidMongoId,
  isValidUkefNumericId,
  isValidPartyUrn,
  isValidNumericId,
  isValidCurrencyCode,
  isValidTeamId,
  sanitizeUsername,
} = require('./validateIds');

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

    it('should return false if an party URN is not a valid URN', () => {
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

    it('should return false if provided an empty object', () => {
      const result = isValidUkefNumericId({});

      expect(result).toEqual(false);
    });

    it('should return false if provided an empty array', () => {
      const result = isValidUkefNumericId([]);

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

    it('should return false if provided an empty object', () => {
      const result = isValidNumericId({});

      expect(result).toEqual(false);
    });

    it('should return false if provided an empty array', () => {
      const result = isValidNumericId([]);

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

    it('should return false if provided an empty object', () => {
      const result = isValidCurrencyCode({});

      expect(result).toEqual(false);
    });

    it('should return false if provided an empty array', () => {
      const result = isValidCurrencyCode([]);

      expect(result).toEqual(false);
    });

    it('should return true if a code is a valid currency code', () => {
      const result = isValidCurrencyCode('USD');

      expect(result).toEqual(true);
    });
  });

  describe('isValidTeamId', () => {
    it('should return false if a team id is not provided', () => {
      const result = isValidTeamId();

      expect(result).toEqual(false);
    });

    it('should return false if the team id is not a valid', () => {
      const result = isValidTeamId('12345');

      expect(result).toEqual(false);
    });

    it('should return false if provided an empty object', () => {
      const result = isValidTeamId({});

      expect(result).toEqual(false);
    });

    it('should return false if provided an empty array', () => {
      const result = isValidTeamId([]);

      expect(result).toEqual(false);
    });

    it('should return true if a team id is a valid currency code', () => {
      const result = isValidTeamId('UNDERWRITERS');

      expect(result).toEqual(true);
    });
  });

  describe('sanitizeUsername', () => {
    it('should not change an alphanumeric string', () => {
      const result = sanitizeUsername('ABC123');

      expect(result).toEqual('ABC123');
    });

    it('should escape dangerous characters', () => {
      // eslint-disable-next-line no-useless-escape, quotes
      const result = sanitizeUsername(`/a\a"a'a<`);

      expect(result).toEqual('&#x2F;aa&quot;a&#x27;a&lt;');
    });
  });
});
