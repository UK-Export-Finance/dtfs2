const crypto = require('crypto');
const { when } = require('jest-when');
const { validPassword } = require('./crypto.util');

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  pbkdf2Sync: jest.fn(),
}));

describe('crypto utils', () => {
  describe('validPassword', () => {
    const ITERATIONS = 10000;
    const KEYLEN = 64;
    const DIGEST = 'sha512';

    const A_SALT = 'a salt';
    const A_PASSWORD = 'a password';
    const A_HASH_AS_HEX = '61206861736820617320686578';
    const A_DIFFERENT_HASH_AS_HEX = '6120646966666572656e742068';
    const A_DIFFERENT_LENGTH_HASH_AS_HEX = '6120646966666572656e74206c656e677468206861736820617320686578';

    const A_HASH_AS_BUFFER = Buffer.from(A_HASH_AS_HEX, 'hex');

    beforeEach(() => {
      crypto.pbkdf2Sync = jest.fn();
      when(crypto.pbkdf2Sync).calledWith(A_PASSWORD, A_SALT, ITERATIONS, KEYLEN, DIGEST).mockReturnValueOnce(A_HASH_AS_BUFFER);
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
    ];

    describe.each(returnFalseTestCases)('$testName', ({ inputHash, inputPassword, inputSalt }) => {
      it('should return false', () => {
        const result = validPassword(inputPassword, inputHash, inputSalt);
        expect(result).toEqual(false);
      });
    });
  });
});
