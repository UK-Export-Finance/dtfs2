const { when, resetAllWhenMocks } = require('jest-when');
const crypto = require('crypto');
const { Hasher } = require('./hasher');

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  timingSafeEqual: jest.fn(),
}));

describe('Hasher', () => {
  describe('hash', () => {
    const saltFromStrategy = Buffer.from('00', 'hex');
    const hashFromStrategy = Buffer.from('01', 'hex');
    const valueToHash = 'a value';

    let hashStrategy;
    let hasher;

    beforeEach(() => {
      resetAllWhenMocks();

      hashStrategy = {
        generateSalt: jest.fn(),
        generateHash: jest.fn(),
      };

      when(hashStrategy.generateSalt).calledWith().mockReturnValueOnce(saltFromStrategy);

      when(hashStrategy.generateHash).calledWith(valueToHash, saltFromStrategy).mockReturnValueOnce(hashFromStrategy);

      hasher = new Hasher(hashStrategy);
    });

    it('returns the salt generated from the hash strategy', () => {
      const { salt } = hasher.hash(valueToHash);
      expect(salt).toEqual(saltFromStrategy);
    });

    it('returns the hash generated from the target and salt from the hash strategy', () => {
      const { hash } = hasher.hash(valueToHash);
      expect(hash).toEqual(hashFromStrategy);
    });
  });

  describe('verifyHash', () => {
    const saltFromStrategy = Buffer.from('00', 'hex');
    const matchingHashFromStrategy = Buffer.from('01', 'hex');
    const nonMatchingHashFromStrategy = Buffer.from('02', 'hex');
    const matchingTarget = 'matching target';
    const nonMatchingTarget = 'non matching target';

    let hashStrategy;
    let hasher;

    beforeEach(() => {
      hashStrategy = {
        generateSalt: jest.fn(),
        generateHash: jest.fn(),
      };

      when(hashStrategy.generateHash).calledWith(matchingTarget, saltFromStrategy).mockReturnValueOnce(matchingHashFromStrategy);
      when(hashStrategy.generateHash).calledWith(nonMatchingTarget, saltFromStrategy).mockReturnValueOnce(nonMatchingHashFromStrategy);

      hasher = new Hasher(hashStrategy);

      when(crypto.timingSafeEqual).calledWith(matchingHashFromStrategy, matchingHashFromStrategy).mockReturnValueOnce(true);
      when(crypto.timingSafeEqual).calledWith(nonMatchingHashFromStrategy, matchingHashFromStrategy).mockReturnValueOnce(false);
    });

    describe('when the hash matches', () => {
      it('returns true', () => {
        const result = hasher.verifyHash({
          target: matchingTarget,
          salt: saltFromStrategy,
          hash: matchingHashFromStrategy,
        });
        expect(result).toEqual(true);
      });
    });

    describe('when the hash does not match', () => {
      it('returns false', () => {
        const result = hasher.verifyHash({
          target: nonMatchingTarget,
          salt: saltFromStrategy,
          hash: matchingHashFromStrategy,
        });
        expect(result).toEqual(false);
      });
    });
  });
});
