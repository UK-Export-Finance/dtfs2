jest.mock('../../drivers/db-client');
const { ObjectId } = require('mongodb');
const { when } = require('jest-when');
const {
  generateMockNoUserLoggedInAuditDatabaseRecord,
  generateNoUserLoggedInAuditDetails,
} = require('@ukef/dtfs2-common/change-stream');
const db = require('../../drivers/db-client');
const { updateSessionIdentifier, createPasswordToken } = require('./controller');
const { TEST_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { InvalidUserIdError } = require('../errors');
const InvalidSessionIdentifierError = require('../errors/invalid-session-identifier.error');

const MOCK_EMAIL = 'mockEmail';

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
      await expect(
        updateSessionIdentifier(
          TEST_USER_INVALID_ID,
          SESSION_IDENTIFIER,
          generateNoUserLoggedInAuditDetails(),
          () => {},
        ),
      ).rejects.toThrow(InvalidUserIdError);
    });

    it('should throw an error if the session identifier is not provided', async () => {
      await expect(
        updateSessionIdentifier(TEST_USER, null, generateNoUserLoggedInAuditDetails(), () => {}),
      ).rejects.toThrow(InvalidSessionIdentifierError);
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
});
