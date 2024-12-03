const { when, resetAllWhenMocks } = require('jest-when');
const { ObjectId } = require('mongodb');
const { cloneDeep } = require('lodash');
const { generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateMockNoUserLoggedInAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { mongoDbClient: db } = require('../../drivers/db-client');
const { UserRepository } = require('./repository');
const { InvalidUserIdError, InvalidUsernameError, UserNotFoundError } = require('../errors');
const { TEST_DATABASE_USER, TEST_USER_TRANSFORMED_FROM_DATABASE } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { USER } = require('../../constants');
const InvalidSessionIdentifierError = require('../errors/invalid-session-identifier.error');

jest.mock('../../drivers/db-client');

const { SIGN_IN_LINK } = require('../../constants');

describe('UserRepository', () => {
  let repository;
  let usersCollection;
  let testDatabaseUser;

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

    testDatabaseUser = cloneDeep(TEST_DATABASE_USER);
  });

  describe('saveSignInTokenForUser', () => {
    const hashHexString = 'a1';
    const saltHexString = 'b2';
    const hash = Buffer.from(hashHexString, 'hex');
    const salt = Buffer.from(saltHexString, 'hex');
    const expiry = new Date().getTime() + SIGN_IN_LINK.DURATION_MILLISECONDS;

    withValidateUserIdTests({
      methodCall: (invalidUserId) =>
        repository.saveSignInTokenForUser({
          userId: invalidUserId,
          signInTokenSalt: salt,
          signInTokenHash: hash,
          auditDetails: generateNoUserLoggedInAuditDetails(),
        }),
    });

    it('saves the sign in code expiry time and the hex strings for its hash and salt on the user document', async () => {
      await repository.saveSignInTokenForUser({
        userId: validUserId,
        signInTokenSalt: salt,
        signInTokenHash: hash,
        expiry,
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        {
          $push: {
            signInTokens: {
              $each: [{ hashHex: hashHexString, saltHex: saltHexString, expiry }],
              $slice: -SIGN_IN_LINK.MAX_SEND_COUNT,
            },
          },
          $set: {
            auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),
          },
        },
      );
    });
  });

  describe('incrementSignInLinkSendCount', () => {
    const expectedSignInLinkSendCount = 2;

    beforeEach(() => {
      when(usersCollection.findOneAndUpdate)
        .calledWith(
          { _id: { $eq: ObjectId(validUserId) } },
          { $inc: { signInLinkSendCount: 1 }, $set: { auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord() } },
          { returnDocument: 'after' },
        )
        .mockImplementation(() => ({
          value: { ...testDatabaseUser, signInLinkSendCount: expectedSignInLinkSendCount },
        }));
    });

    withValidateUserIdTests({
      methodCall: (invalidUserId) =>
        repository.incrementSignInLinkSendCount({
          userId: invalidUserId,
          auditDetails: generateNoUserLoggedInAuditDetails(),
        }),
    });

    it("increments the user's signInLinkSendCount by 1", async () => {
      await repository.incrementSignInLinkSendCount({
        userId: validUserId,
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(usersCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        { $inc: { signInLinkSendCount: 1 }, $set: { auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord() } },
        { returnDocument: 'after' },
      );
    });

    it("returns the user's updated signInLinkSendCount", async () => {
      const response = await repository.incrementSignInLinkSendCount({
        userId: validUserId,
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

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

    withValidateUserIdTests({
      methodCall: (invalidUserId) => repository.setSignInLinkSendDate({ userId: invalidUserId, auditDetails: generateNoUserLoggedInAuditDetails() }),
    });

    it('updates the users signInLinkSendDate to the current date', async () => {
      await repository.setSignInLinkSendDate({
        userId: validUserId,
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        { $set: { auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(), signInLinkSendDate: dateNow } },
      );
    });
  });

  describe('resetSignInData', () => {
    withValidateUserIdTests({
      methodCall: (invalidUserId) => repository.resetSignInData({ userId: invalidUserId, auditDetails: generateNoUserLoggedInAuditDetails() }),
    });

    it('updates the users signInLinkSendCount and signInLinkSendDate', async () => {
      await repository.resetSignInData({ userId: validUserId, auditDetails: generateNoUserLoggedInAuditDetails() });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        {
          $set: { auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord() },
          $unset: { signInLinkSendCount: '', signInLinkSendDate: '', signInTokens: '' },
        },
      );
    });
  });

  describe('updateLastLoginAndResetSignInData', () => {
    let dateNow;
    const aSessionIdentifier = 'a session identifier';
    beforeAll(() => {
      jest.useFakeTimers();
      dateNow = Date.now();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    withValidateUserIdTests({
      methodCall: (invalidUserId) =>
        repository.updateLastLoginAndResetSignInData({
          userId: invalidUserId,
          sessionIdentifier: aSessionIdentifier,
          auditDetails: generateNoUserLoggedInAuditDetails(),
        }),
    });

    withValidateSessionIdentifierTests({
      methodCall: (invalidSessionIdentifier) =>
        repository.updateLastLoginAndResetSignInData({
          userId: validUserId,
          sessionIdentifier: invalidSessionIdentifier,
          auditDetails: generateNoUserLoggedInAuditDetails(),
        }),
    });

    it('updates the relevant user fields', async () => {
      await repository.updateLastLoginAndResetSignInData({
        userId: validUserId,
        sessionIdentifier: aSessionIdentifier,
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        {
          $set: {
            auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),
            lastLogin: dateNow,
            loginFailureCount: 0,
            sessionIdentifier: aSessionIdentifier,
          },
          $unset: { signInLinkSendCount: '', signInLinkSendDate: '', signInTokens: '' },
        },
      );
    });
  });

  describe('blockUser', () => {
    withValidateUserIdTests({
      methodCall: (invalidUserId) => repository.blockUser({ userId: invalidUserId, auditDetails: generateNoUserLoggedInAuditDetails() }),
    });

    it('updates user-status and blockedStatusReason', async () => {
      const aReason = USER.STATUS_BLOCKED_REASON.INVALID_PASSWORD;
      await repository.blockUser({
        userId: validUserId,
        reason: aReason,
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(validUserId) } },
        {
          $set: {
            auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),
            'user-status': USER.STATUS.BLOCKED,
            blockedStatusReason: aReason,
          },
        },
      );
    });
  });

  describe('find user', () => {
    let testUserTransformedFromDatabase;

    beforeEach(() => {
      testUserTransformedFromDatabase = cloneDeep(TEST_USER_TRANSFORMED_FROM_DATABASE);
    });

    describe('findById', () => {
      withValidateUserIdTests({ methodCall: (invalidUserId) => repository.findById(invalidUserId) });

      it('returns the user if found', async () => {
        when(usersCollection.findOne)
          .calledWith({ _id: { $eq: ObjectId(validUserId) } })
          .mockImplementation(() => testDatabaseUser);

        const user = await repository.findById(validUserId);

        expect(user).toEqual(testUserTransformedFromDatabase);
      });

      it('throws an InvalidUserIdError if the id is not valid', async () => {
        const invalidUserId = 'not a valid id';

        when(usersCollection.findOne)
          .calledWith(expect.anything())
          .mockImplementation(() => testDatabaseUser);

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
          .mockImplementation(() => testDatabaseUser);

        const user = await repository.findByUsername(validUsername);

        expect(user).toEqual(testUserTransformedFromDatabase);
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
    it('throws an InvalidSessionIdentifierError if the sessionIdentifier is not valid', async () => {
      const invalidSessionIdentier = null;

      await expect(methodCall(invalidSessionIdentier)).rejects.toThrow(InvalidSessionIdentifierError);
    });
  }
});
