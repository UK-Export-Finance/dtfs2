const { when, resetAllWhenMocks } = require('jest-when');
const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { UserRepository } = require('./repository');
const { InvalidUserIdError, InvalidUsernameError, UserNotFoundError } = require('../errors');
const { TEST_DATABASE_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { USER } = require('../../constants');
const InvalidSessionIdentierError = require('../errors/invalid-session-identifier.error');

jest.mock('../../drivers/db-client');

const { SIGN_IN_LINK } = require('../../constants');

describe('UserRepository', () => {
  let repository;
  let usersCollection;

  const validUserId = 'aaaa1234aaaabbbb5678bbbb';

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
    repository = new UserRepository();

    usersCollection = {
      updateOne: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    when(db.getCollection).calledWith('users').mockResolvedValueOnce(usersCollection);
  });

  describe('saveSignInTokenForUser', () => {
    const hashHexString = 'a1';
    const saltHexString = 'b2';
    const hash = Buffer.from(hashHexString, 'hex');
    const salt = Buffer.from(saltHexString, 'hex');
    const expiry = new Date().getTime() + SIGN_IN_LINK.DURATION_MILLISECONDS;

    withValidateUserIdTests({
      methodCall: (invalidUserId) => repository.saveSignInTokenForUser({ userId: invalidUserId, signInTokenSalt: salt, signInTokenHash: hash }),
    });

    it('saves the sign in code expiry time and the hex strings for its hash and salt on the user document', async () => {
      await repository.saveSignInTokenForUser({
        userId: validUserId,
        signInTokenSalt: salt,
        signInTokenHash: hash,
        expiry,
      });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        { $set: { signInToken: { hashHex: hashHexString, saltHex: saltHexString, expiry } } },
      );
    });
  });

  describe('deleteSignInTokenForUser', () => {
    const userId = 'aaaa1234aaaabbbb5678bbbb';

    withValidateUserIdTests({ methodCall: (invalidUserId) => repository.deleteSignInTokenForUser(invalidUserId) });

    it('deletes the signInToken field on the user document', async () => {
      await repository.deleteSignInTokenForUser(userId);

      expect(usersCollection.updateOne).toHaveBeenCalledWith({ _id: { $eq: ObjectId(validUserId) } }, { $unset: { signInToken: '' } });
    });
  });

  describe('incrementSignInLinkSendCount', () => {
    const expectedSignInLinkSendCount = 2;

    beforeEach(() => {
      when(usersCollection.findOneAndUpdate)
        .calledWith({ _id: { $eq: ObjectId(validUserId) } }, { $inc: { signInLinkSendCount: 1 } }, { returnDocument: 'after' })
        .mockImplementation(() => ({ value: { ...TEST_DATABASE_USER, signInLinkSendCount: expectedSignInLinkSendCount } }));
    });

    withValidateUserIdTests({ methodCall: (invalidUserId) => repository.incrementSignInLinkSendCount({ userId: invalidUserId }) });

    it("increments the user's signInLinkSendCount by 1", async () => {
      await repository.incrementSignInLinkSendCount({ userId: validUserId });

      expect(usersCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        { $inc: { signInLinkSendCount: 1 } },
        { returnDocument: 'after' },
      );
    });

    it("returns the user's updated signInLinkSendCount", async () => {
      const response = await repository.incrementSignInLinkSendCount({ userId: validUserId });

      expect(response).toEqual(expectedSignInLinkSendCount);
    });
  });

  describe('setSignInLinkSendDate', () => {
    let dateNow;
    beforeAll(() => {
      jest.useFakeTimers();
      dateNow = Date.now();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    withValidateUserIdTests({ methodCall: (invalidUserId) => repository.setSignInLinkSendDate({ userId: invalidUserId }) });

    it('updates the users signInLinkSendDate to the current date', async () => {
      await repository.setSignInLinkSendDate({ userId: validUserId });

      expect(usersCollection.updateOne).toHaveBeenCalledWith({ _id: { $eq: ObjectId(validUserId) } }, { $set: { signInLinkSendDate: dateNow } });
    });
  });

  describe('resetSignInLinkSendCountAndDate', () => {
    withValidateUserIdTests({ methodCall: (invalidUserId) => repository.resetSignInLinkSendCountAndDate({ userId: invalidUserId }) });

    it('updates the users signInLinkSendCount and signInLinkSendDate', async () => {
      await repository.resetSignInLinkSendCountAndDate({ userId: validUserId });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        { $unset: { signInLinkSendCount: '', signInLinkSendDate: '' } },
      );
    });
  });

  describe('updateLastLogin', () => {
    let dateNow;
    const aSessionIdentifier = 'a session identifier';
    beforeAll(() => {
      jest.useFakeTimers();
      dateNow = Date.now();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    withValidateUserIdTests({ methodCall: (invalidUserId) => repository.updateLastLogin({ userId: invalidUserId, sessionIdentifier: aSessionIdentifier }) });

    withValidateSessionIdentifierTests({
      methodCall: (invalidSessionIdentifier) => repository.updateLastLogin({ userId: validUserId, sessionIdentifier: invalidSessionIdentifier }),
    });

    it('updates the relevant user fields', async () => {
      await repository.updateLastLogin({ userId: validUserId, sessionIdentifier: aSessionIdentifier });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        {
          $set: { lastLogin: dateNow, loginFailureCount: 0, sessionIdentifier: aSessionIdentifier },
          $unset: { signInLinkSendCount: '', signInLinkSendDate: '' },
        },
      );
    });
  });

  describe('blockUser', () => {
    withValidateUserIdTests({ methodCall: (invalidUserId) => repository.blockUser({ userId: invalidUserId }) });

    it('updates user-status and blockedStatusReason', async () => {
      const aReason = USER.STATUS_BLOCKED_REASON.INVALID_PASSWORD;
      await repository.blockUser({ userId: validUserId, reason: aReason });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        {
          $set: {
            'user-status': USER.STATUS.BLOCKED,
            blockedStatusReason: aReason,
          },
        },
      );
    });
  });

  describe('find user', () => {
    const TEST_USER_RESULT = { ...TEST_DATABASE_USER };
    const { hashHex, saltHex, expiry } = TEST_USER_RESULT.signInToken;
    TEST_USER_RESULT.signInToken = { salt: Buffer.from(saltHex, 'hex'), hash: Buffer.from(hashHex, 'hex'), expiry };

    describe('findById', () => {
      withValidateUserIdTests({ methodCall: (invalidUserId) => repository.findById(invalidUserId) });

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

      withValidateUsernameTests({ methodCall: (invalidUsername) => repository.findByUsername(invalidUsername) });

      it('returns the user if found', async () => {
        when(usersCollection.findOne)
          .calledWith({ username: { $eq: validUsername } }, { collation: { locale: 'en', strength: 2 } })
          .mockImplementation(() => TEST_DATABASE_USER);

        const user = await repository.findByUsername(validUsername);

        expect(user).toEqual(TEST_USER_RESULT);
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

  function withValidateUserIdTests({ methodCall }) {
    it('throws an InvalidUserIdError if the id is not valid', async () => {
      const invalidUserId = 'not a valid id';

      await expect(methodCall(invalidUserId)).rejects.toThrow(InvalidUserIdError);
    });
  }

  function withValidateUsernameTests({ methodCall }) {
    it('throws an InvalidUsernameError if the username is not valid', async () => {
      const invalidUsername = { name: 'not a valid id' };

      await expect(methodCall(invalidUsername)).rejects.toThrow(InvalidUsernameError);
    });
  }
  function withValidateSessionIdentifierTests({ methodCall }) {
    it('throws an InvalidSessionIdentierError if the sessionIdentifier is not valid', async () => {
      const invalidSessionIdentier = null;

      await expect(methodCall(invalidSessionIdentier)).rejects.toThrow(InvalidSessionIdentierError);
    });
  }
});
