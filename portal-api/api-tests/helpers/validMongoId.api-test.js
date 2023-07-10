const validMongoId = require('../../src/v1/helpers/validMongoId');

describe('validMongoId', () => {
  it('should return false if an id is not provided', () => {
    const result = validMongoId();

    expect(result).toEqual(false);
  });

  it('should return false if an id is not a valid mongo id', () => {
    const result = validMongoId('12345');

    expect(result).toEqual(false);
  });

  it('should return true if an id is a valid mongo id', () => {
    const result = validMongoId('620a1aa095a618b12da38c7b');

    expect(result).toEqual(true);
  });
});
