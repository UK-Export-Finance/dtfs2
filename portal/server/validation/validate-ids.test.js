const { isValidMongoId, isNotValidCompaniesHouseNumber } = require('./validate-ids');

describe('validate-ids', () => {
  describe('isValidMongoId', () => {
    it('should return false if an id is not provided', () => {
      const result = isValidMongoId();

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId('12345');

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId('127.0.0.1');

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId('../../etc');

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId({});

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId([]);

      expect(result).toEqual(false);
    });

    it('should return true if an id is a valid mongo id', () => {
      const result = isValidMongoId('620a1aa095a618b12da38c7b');

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

    it('should return true if input not a valid companies house number', () => {
      const result = isNotValidCompaniesHouseNumber('127.0.0.1');

      expect(result).toEqual(true);
    });

    it('should return true if input not a valid companies house number', () => {
      const result = isNotValidCompaniesHouseNumber('../../etc');

      expect(result).toEqual(true);
    });

    it('should return true if input not a valid companies house number', () => {
      const result = isNotValidCompaniesHouseNumber({});

      expect(result).toEqual(true);
    });

    it('should return true if input not a valid companies house number', () => {
      const result = isNotValidCompaniesHouseNumber([]);

      expect(result).toEqual(true);
    });
  });
});
