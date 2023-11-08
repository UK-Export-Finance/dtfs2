jest.mock('../../drivers/db-client');
const { ObjectId } = require('mongodb');
const { when } = require('jest-when');
const db = require('../../drivers/db-client');
const { updateSessionIdentifier, updateLastLogin } = require('./controller');
const { TEST_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');

describe('user controller', () => {

  const SESSION_IDENTIFIER = 'MockSessionId';
  describe.each([
    {
      testName: 'updateSessionIdentifier',
      callTestMethod: (user, sessionIdentifier, callback) => updateSessionIdentifier(user, sessionIdentifier, callback),
      expectedUpdate: { sessionIdentifier: SESSION_IDENTIFIER },
    },
    {
      testName: 'updateLastLogin',
      callTestMethod: (user, sessionIdentifier, callback) => updateLastLogin(user, sessionIdentifier, callback),
      expectedUpdate: { lastLogin: expect.any(String), loginFailureCount: 0, sessionIdentifier: SESSION_IDENTIFIER },
    },
  ])('$testName', ({ callTestMethod, expectedUpdate }) => {
    let mockUpdateOne;

    beforeEach(() => {
      mockUpdateOne = jest.fn();
      when(db.getCollection).calledWith('users').mockResolvedValue({ updateOne: mockUpdateOne });
    });

    it('should throw an error if the user id is invalid', async () => {
      const TEST_USER_INVALID_ID = { ...TEST_USER, _id: 'invalid' };
      await expect(callTestMethod(TEST_USER_INVALID_ID, SESSION_IDENTIFIER, () => {})).rejects.toThrow('Invalid User Id');
    });

    it('should throw an error if the session identifier is not provided', async () => {
      await expect(callTestMethod(TEST_USER, null, () => {})).rejects.toThrow('No session identifier was provided');
    });

    it('should update the session identifier', async () => {
      await callTestMethod(TEST_USER, SESSION_IDENTIFIER, () => {});
      expect(mockUpdateOne).toHaveBeenCalledWith({ _id: { $eq: ObjectId(TEST_USER._id) } }, { $set: expectedUpdate }, {});
    });

    it('should call the callback if successful', async () => {
      const mockCallback = jest.fn();
      await callTestMethod(TEST_USER, SESSION_IDENTIFIER, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});
