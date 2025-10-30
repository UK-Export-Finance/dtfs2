const crypto = require('crypto');
const { when } = require('jest-when');
const { CRYPTO } = require('@ukef/dtfs2-common');
const { validPassword } = require('./crypto.util');

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  pbkdf2Sync: jest.fn(),
}));

describe('crypto utils', () => {
  describe('validPassword', () => {
    const A_SALT = 'a salt';
    const A_PASSWORD = 'a password';
    const A_HASH_AS_HEX = '61206861736820617320686578';
    const A_DIFFERENT_HASH_AS_HEX = '6120646966666572656e742068';
    const A_DIFFERENT_LENGTH_HASH_AS_HEX = '6120646966666572656e74206c656e677468206861736820617320686578';

    const A_HASH_AS_BUFFER = Buffer.from(A_HASH_AS_HEX, 'hex');

    beforeEach(() => {
      crypto.pbkdf2Sync = jest.fn();
      when(crypto.pbkdf2Sync)
        .calledWith(A_PASSWORD, A_SALT, CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM)
        .mockReturnValueOnce(A_HASH_AS_BUFFER);
    });

    describe('when password hash matches the hash', () => {
      it('should return true', () => {
        const result = validPassword(A_PASSWORD, A_HASH_AS_HEX, A_SALT);

        expect(result).toEqual(true);
      });
    });

    const returnFalseTestCases = [
      {
        testName: 'when the hash is undefined',
        inputHash: undefined,
        inputSalt: A_SALT,
        inputPassword: A_PASSWORD,
      },
      {
        testName: 'when the salt is undefined',
        inputHash: A_HASH_AS_HEX,
        inputSalt: undefined,
        inputPassword: A_PASSWORD,
      },
      {
        testName: 'when the hashes have different lengths',
        inputHash: A_DIFFERENT_LENGTH_HASH_AS_HEX,
        inputSalt: A_SALT,
        inputPassword: A_PASSWORD,
      },
      { testName: 'when the hashes do not match', inputHash: A_DIFFERENT_HASH_AS_HEX, inputSalt: A_SALT },
      { testName: 'when no hash is supplied', inputPassword: A_PASSWORD, inputSalt: A_SALT },
      { testName: 'when no salt is supplied', inputPassword: A_PASSWORD, inputHash: A_DIFFERENT_HASH_AS_HEX },
      { testName: 'when password, salt, hash are all empty', inputPassword: '', inputSalt: '', inputHash: '' },
      { testName: 'when password, salt, hash are all empty spaces', inputPassword: ' ', inputSalt: '   ', inputHash: ' ' },
      { testName: 'when password is empty string', inputPassword: ' ', inputSalt: A_SALT, inputHash: A_DIFFERENT_HASH_AS_HEX },
      { testName: 'when salt is empty string', inputPassword: A_PASSWORD, inputSalt: '   ', inputHash: A_DIFFERENT_HASH_AS_HEX },
      { testName: 'when no input is supplied' },
    ];

    describe.each(returnFalseTestCases)('$testName', ({ inputHash, inputPassword, inputSalt }) => {
      it('should return false', () => {
        const result = validPassword(inputPassword, inputHash, inputSalt);
        expect(result).toEqual(false);
      });
    });
  });
});
