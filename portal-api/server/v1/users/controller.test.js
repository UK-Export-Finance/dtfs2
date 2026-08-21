jest.mock('../../drivers/db-client');
jest.mock('./sanitizeUserData');
jest.mock('../email');
jest.mock('@ukef/dtfs2-common/payload-verification');
jest.mock('../../crypto/utils');
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortal2FAFeatureFlagEnabled: jest.fn(),
}));

const { ObjectId } = require('mongodb');
const { when, resetAllWhenMocks } = require('jest-when');
const { isPortal2FAFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { generateNoUserLoggedInAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateMockNoUserLoggedInAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const { mongoDbClient: db } = require('../../drivers/db-client');
const { updateSessionIdentifier, createPasswordToken, create, update } = require('./controller');
const { TEST_USER, TEST_DATABASE_USER, TEST_USER_SANITISED_FOR_FRONTEND } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { STATUS } = require('../../constants/user');
const { InvalidUserIdError } = require('../errors');
const InvalidSessionIdentifierError = require('../errors/invalid-session-identifier.error');
const { sanitizeUser } = require('./sanitizeUserData');
const sendEmail = require('../email');
const CONSTANTS = require('../../constants');

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
      isPortal2FAFeatureFlagEnabled.mockReturnValue(false);
      when(db.getCollection)
        .calledWith('users')
        .mockResolvedValue({
          insertOne: jest.fn().mockResolvedValue({ insertedId: TEST_DATABASE_USER._id }),
          findOne: jest.fn().mockImplementation(async (id, findOneCallback) => await findOneCallback(null, TEST_DATABASE_USER)),
          findOneAndUpdate: jest.fn().mockResolvedValue(TEST_DATABASE_USER),
        });
    }

    describe('when reactivating a blocked user', () => {
      const BLOCKED_DATABASE_USER = {
        ...TEST_DATABASE_USER,
        'user-status': STATUS.BLOCKED,
        blockedStatusReason: 'Too many invalid password entries',
        loginFailureCount: 3,
      };
      const reactivationUpdate = { 'user-status': STATUS.ACTIVE };
      let mockFindOneAndUpdate;

      beforeEach(() => {
        jest.resetAllMocks();
        resetAllWhenMocks();
        sendEmail.mockResolvedValue({});
        isPortal2FAFeatureFlagEnabled.mockReturnValue(false);
        mockFindOneAndUpdate = jest.fn().mockResolvedValue(BLOCKED_DATABASE_USER);
        db.getCollection.mockResolvedValue({
          findOne: jest.fn().mockImplementation(async (id, findOneCallback) => await findOneCallback(null, BLOCKED_DATABASE_USER)),
          findOneAndUpdate: mockFindOneAndUpdate,
        });
      });

      it('should send an unblocked email to the user', async () => {
        // Arrange
        isVerifiedPayload.mockReturnValue(true);

        // Act
        await new Promise((resolve) => {
          update(TEST_DATABASE_USER._id, reactivationUpdate, generatePortalAuditDetails(new ObjectId()), resolve);
        });

        // Assert
        expect(sendEmail).toHaveBeenCalledWith(CONSTANTS.EMAIL_TEMPLATE_IDS.UNBLOCKED, BLOCKED_DATABASE_USER.email, {});
      });

      it('should reset loginFailureCount to 0', async () => {
        // Arrange
        isVerifiedPayload.mockReturnValue(true);

        // Act
        await new Promise((resolve) => {
          update(TEST_DATABASE_USER._id, reactivationUpdate, generatePortalAuditDetails(new ObjectId()), resolve);
        });

        // Assert
        expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ $set: expect.objectContaining({ loginFailureCount: 0 }) }),
          expect.anything(),
        );
      });

      describe('when the portal 2FA feature flag is disabled', () => {
        beforeEach(() => {
          isPortal2FAFeatureFlagEnabled.mockReturnValue(false);
        });

        it('should unset signInLinkSendDate, signInLinkSendCount, and blockedStatusReason', async () => {
          // Arrange
          isVerifiedPayload.mockReturnValue(true);

          // Act
          await new Promise((resolve) => {
            update(TEST_DATABASE_USER._id, reactivationUpdate, generatePortalAuditDetails(new ObjectId()), resolve);
          });

          // Assert
          const expected = [
            expect.anything(),
            expect.objectContaining({
              $unset: {
                signInLinkSendDate: '',
                signInLinkSendCount: '',
                blockedStatusReason: '',
              },
            }),
            expect.anything(),
          ];

          expect(mockFindOneAndUpdate).toHaveBeenCalledWith(...expected);
        });
      });

      describe('when the portal 2FA feature flag is enabled', () => {
        beforeEach(() => {
          isPortal2FAFeatureFlagEnabled.mockReturnValue(true);
        });

        it('should unset signInOTPSendDate, signInOTPSendCount, and blockedStatusReason', async () => {
          // Arrange
          isVerifiedPayload.mockReturnValue(true);

          // Act
          await new Promise((resolve) => {
            update(TEST_DATABASE_USER._id, reactivationUpdate, generatePortalAuditDetails(new ObjectId()), resolve);
          });

          // Assert
          const expected = [
            expect.anything(),
            expect.objectContaining({
              $unset: {
                signInOTPSendDate: 0,
                signInOTPSendCount: 0,
                blockedStatusReason: '',
              },
            }),
            expect.anything(),
          ];

          expect(mockFindOneAndUpdate).toHaveBeenCalledWith(...expected);
        });
      });
    });
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
