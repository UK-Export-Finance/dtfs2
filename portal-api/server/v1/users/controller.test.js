jest.mock('../../drivers/db-client');
jest.mock('./sanitizeUserData');
jest.mock('../email');
jest.mock('@ukef/dtfs2-common/payload-verification');
jest.mock('../../crypto/utils');
const { ObjectId } = require('mongodb');
const { when, resetAllWhenMocks } = require('jest-when');
const { generateNoUserLoggedInAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateMockNoUserLoggedInAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const { mongoDbClient: db } = require('../../drivers/db-client');
const { updateSessionIdentifier, createPasswordToken, create, update } = require('./controller');
const { TEST_USER, TEST_DATABASE_USER, TEST_USER_SANITISED_FOR_FRONTEND } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { InvalidUserIdError } = require('../errors');
const InvalidSessionIdentifierError = require('../errors/invalid-session-identifier.error');
const { sanitizeUser } = require('./sanitizeUserData');
const sendEmail = require('../email');

const MOCK_EMAIL = 'mockEmail';
const utils = require('../../crypto/utils');

describe('user controller', () => {
  const SESSION_IDENTIFIER = 'MockSessionId';
  describe('updateSessionIdentifier', () => {
    let mockUpdateOne;

    beforeEach(() => {
      mockUpdateOne = jest.fn();
      when(db.getCollection).calledWith('users').mockResolvedValue({ updateOne: mockUpdateOne });
    });

    it('should throw an error if the user id is invalid', async () => {
      const TEST_USER_INVALID_ID = { ...TEST_USER, _id: 'invalid' };
      await expect(updateSessionIdentifier(TEST_USER_INVALID_ID, SESSION_IDENTIFIER, generateNoUserLoggedInAuditDetails(), () => {})).rejects.toThrow(
        InvalidUserIdError,
      );
    });

    it('should throw an error if the session identifier is not provided', async () => {
      await expect(updateSessionIdentifier(TEST_USER, null, generateNoUserLoggedInAuditDetails(), () => {})).rejects.toThrow(InvalidSessionIdentifierError);
    });

    it('should update the session identifier', async () => {
      await updateSessionIdentifier(TEST_USER, SESSION_IDENTIFIER, generateNoUserLoggedInAuditDetails(), () => {});

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(TEST_USER._id) } },
        {
          $set: {
            sessionIdentifier: SESSION_IDENTIFIER,
            auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),
          },
        },
        {},
      );
    });

    it('should call the callback if successful', async () => {
      const mockCallback = jest.fn();
      await updateSessionIdentifier(TEST_USER, SESSION_IDENTIFIER, generateNoUserLoggedInAuditDetails(), mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  // Here we run tests to check that if a user is in the disabled or blocked state
  // then no token is returned.
  describe('createPasswordToken', () => {
    let userService;

    it('if the user is blocked or disabled then no token is returned', async () => {
      const mockFindOne = jest.fn().mockResolvedValue(TEST_USER);
      when(db.getCollection).calledWith('users').mockResolvedValue({ findOne: mockFindOne });
      userService = {
        isUserBlockedOrDisabled: jest.fn().mockImplementationOnce(() => true),
      };

      const token = await createPasswordToken(MOCK_EMAIL, userService, generateNoUserLoggedInAuditDetails());

      expect(token).toEqual(false);
    });

    it('if the user does not exist then no token is returned', async () => {
      const mockFindOne = jest.fn().mockResolvedValue(null);
      when(db.getCollection).calledWith('users').mockResolvedValue({ findOne: mockFindOne });
      userService = {
        isUserBlockedOrDisabled: jest.fn().mockImplementationOnce(() => false),
      };

      const token = await createPasswordToken(MOCK_EMAIL, userService, generateNoUserLoggedInAuditDetails());

      expect(token).toEqual(false);
    });
  });

  describe('create', () => {
    let mockUserService;

    withValidationTests({
      givenEverythingElseSucceeds,
      makeRequest: (testUser, mockCallback) => create(testUser, mockUserService, generatePortalAuditDetails(new ObjectId()), mockCallback),
      successResult: TEST_USER_SANITISED_FOR_FRONTEND,
    });

    function givenEverythingElseSucceeds() {
      sendEmail.mockResolvedValue({});
      sanitizeUser.mockReturnValue(TEST_USER_SANITISED_FOR_FRONTEND);
      utils.genPasswordResetToken.mockReturnValue({ hash: '02' });
      when(db.getCollection)
        .calledWith('users')
        .mockResolvedValue({
          insertOne: jest.fn().mockResolvedValue({ insertedId: TEST_DATABASE_USER._id }),
          findOne: jest.fn().mockResolvedValue(TEST_DATABASE_USER),
          updateOne: jest.fn(),
        });
      mockUserService = { isUserBlockedOrDisabled: jest.fn().mockReturnValue(false) };
    }
  });

  describe('update', () => {
    withValidationTests({
      givenEverythingElseSucceeds,
      makeRequest: (testUser, mockCallback) => update(testUser._id, testUser, generatePortalAuditDetails(new ObjectId()), mockCallback),
      successResult: TEST_DATABASE_USER,
    });

    function givenEverythingElseSucceeds() {
      sendEmail.mockResolvedValue({});
      when(db.getCollection)
        .calledWith('users')
        .mockResolvedValue({
          insertOne: jest.fn().mockResolvedValue({ insertedId: TEST_DATABASE_USER._id }),
          findOne: jest.fn().mockImplementation(async (id, findOneCallback) => await findOneCallback(null, TEST_DATABASE_USER)),
          findOneAndUpdate: jest.fn().mockResolvedValue(TEST_DATABASE_USER),
        });
      utils.genPassword.mockReturnValue({ salt: '01', hash: '02' });
    }
  });

  function withValidationTests({ givenEverythingElseSucceeds, makeRequest, successResult }) {
    describe('validation', () => {
      let mockCallback;

      beforeEach(() => {
        jest.resetAllMocks();
        resetAllWhenMocks();
        givenEverythingElseSucceeds();
        mockCallback = jest.fn();
      });

      it('should call the callback with "invalid user payload" if the validation fails', async () => {
        isVerifiedPayload.mockReturnValue(false);

        await makeRequest(TEST_USER, mockCallback);

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith('Invalid user payload', expect.anything());
      });

      it('should call the callback with the sanitised user if the validation passes', async () => {
        isVerifiedPayload.mockReturnValue(true);

        await makeRequest(TEST_USER, mockCallback);

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(null, successResult);
      });
    });
  }
});
