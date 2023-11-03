const { when } = require('jest-when');
const { Hasher } = require('./hasher');

describe('Hasher', () => {
  describe('hash', () => {
    const saltFromStrategy = Buffer.from('00', 'hex');
    const hashFromStrategy = Buffer.from('01', 'hex');
    const valueToHash = 'a value';

    let hashStrategy;
    let hasher;

    beforeEach(() => {
      hashStrategy = {
        generateSalt: jest.fn(),
        generateHash: jest.fn(),
      };

      when(hashStrategy.generateSalt)
        .calledWith()
        .mockReturnValueOnce(saltFromStrategy);

      when(hashStrategy.generateHash)
        .calledWith(valueToHash, saltFromStrategy)
        .mockReturnValueOnce(hashFromStrategy);

      hasher = new Hasher(hashStrategy);
    });

    it('returns the salt generated from the hash strategy', () => {
      const { salt } = hasher.hash(valueToHash);
      expect(salt).toBe(saltFromStrategy);
    });

    it('returns the hash generated from the target and salt from the hash strategy', () => {
      const { hash } = hasher.hash(valueToHash);
      expect(hash).toBe(hashFromStrategy);
    });
  });
});
