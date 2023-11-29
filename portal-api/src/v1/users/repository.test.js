const { when, resetAllWhenMocks } = require('jest-when');
const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { UserRepository } = require('./repository');
const { InvalidUserIdError, InvalidUsernameError, UserNotFoundError } = require('../errors');
const { TEST_DATABASE_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');

jest.mock('../../drivers/db-client');

const { SIGN_IN_LINK_DURATION } = require('../../constants');

describe('UserRepository', () => {
  let repository;
  let usersCollection;

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
    repository = new UserRepository();

    usersCollection = {
      updateOne: jest.fn(),
      findOne: jest.fn(),
    };
    when(db.getCollection).calledWith('users').mockResolvedValueOnce(usersCollection);
  });

  describe('saveSignInTokenForUser', () => {
    const userId = 'aaaa1234aaaabbbb5678bbbb';
    const hashHexString = 'a1';
    const saltHexString = 'b2';
    const hash = Buffer.from(hashHexString, 'hex');
    const salt = Buffer.from(saltHexString, 'hex');
    const expiry = new Date().getTime() + SIGN_IN_LINK_DURATION.MILLISECONDS;

    it('saves the sign in code expiry time and the hex strings for its hash and salt on the user document', async () => {
      await repository.saveSignInTokenForUser({
        userId,
        signInTokenSalt: salt,
        signInTokenHash: hash,
        expiry,
      });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(userId) } },
        { $set: { signInToken: { hashHex: hashHexString, saltHex: saltHexString, expiry } } },
      );
    });
  });

  describe('deleteSignInTokenForUser', () => {
    const userId = 'aaaa1234aaaabbbb5678bbbb';

    it('deletes the signInToken field on the user document', async () => {
      await repository.deleteSignInTokenForUser(userId);

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(userId) } },
        { $unset: { signInToken: '' } },
      );
    });
  });

  describe('find user', () => {
    const TEST_USER_RESULT = { ...TEST_DATABASE_USER };
    const { hashHex, saltHex, expiry } = TEST_USER_RESULT.signInToken;
    TEST_USER_RESULT.signInToken = { salt: Buffer.from(saltHex, 'hex'), hash: Buffer.from(hashHex, 'hex'), expiry };

    describe('findById', () => {
      const validUserId = 'aaaa1234aaaabbbb5678bbbb';

      it('returns the user if found', async () => {
        when(usersCollection.findOne)
          .calledWith({ _id: { $eq: ObjectId(validUserId) } })
          .mockImplementation(() => TEST_DATABASE_USER);

        const user = await repository.findById(validUserId);

        expect(user).toEqual(TEST_USER_RESULT);
      });

      it('throws an InvalidUserIdError if the id is not valid', async () => {
        const invalidUserId = 'not a valid id';

        when(usersCollection.findOne)
          .calledWith(expect.anything())
          .mockImplementation(() => TEST_DATABASE_USER);

        await expect(repository.findById(invalidUserId)).rejects.toThrow(InvalidUserIdError);
      });

      it('throws a UserNotFoundError if the user is not found', async () => {
        when(usersCollection.findOne)
          .calledWith(expect.anything())
          .mockImplementation(() => null);

        await expect(repository.findById(validUserId)).rejects.toThrow(UserNotFoundError);
      });

      it('passes through the error if collection.findOne throws an error', async () => {
        when(usersCollection.findOne)
          .calledWith(expect.anything())
          .mockImplementation(() => {
            throw new Error();
          });

        await expect(repository.findById(validUserId)).rejects.toThrow(Error);
      });
    });

    describe('findByUsername', () => {
      const validUsername = 'A Valid Username';

      it('returns the user if found', async () => {
        when(usersCollection.findOne)
          .calledWith({ username: { $eq: validUsername } }, { collation: { locale: 'en', strength: 2 } })
          .mockImplementation(() => TEST_DATABASE_USER);

        const user = await repository.findByUsername(validUsername);

        expect(user).toEqual(TEST_USER_RESULT);
      });

      it('throws an InvalidUsernameError if the username is not valid', async () => {
        const invalidUsername = { name: 'not a valid id' };

        when(usersCollection.findOne)
          .calledWith(expect.anything(), expect.anything())
          .mockImplementation(() => TEST_DATABASE_USER);

        await expect(repository.findByUsername(invalidUsername)).rejects.toThrow(InvalidUsernameError);
      });

      it('throws a UserNotFoundError if the user is not found', async () => {
        when(usersCollection.findOne)
          .calledWith(expect.anything(), expect.anything())
          .mockImplementation(() => null);

        await expect(repository.findByUsername(validUsername)).rejects.toThrow(UserNotFoundError);
      });

      it('passes through the error if collection.findOne throws an error', async () => {
        when(usersCollection.findOne)
          .calledWith(expect.anything(), expect.anything())
          .mockImplementation(() => {
            throw new Error();
          });

        await expect(repository.findByUsername(validUsername)).rejects.toThrow(Error);
      });
    });
  });
});
