const existingTfmUser = require('./get-existing-tfm-user');
const userController = require('../../user/user.controller');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');
const MOCK_TFM_USERS = require('../../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

describe('auth-service/get-existing-tfm-user', () => {
  beforeAll(() => {
    userController.findByEmails = jest.fn().mockResolvedValue(MOCK_TFM_USER);
  });

  describe('when the provided entra user does not have a secondary_email', () => {
    it('should call userController.findByEmails with entra user user email', async () => {
      await existingTfmUser.get(MOCK_ENTRA_USER);

      expect(userController.findByEmails).toHaveBeenCalledTimes(1);

      const expected = MOCK_ENTRA_USER.idTokenClaims.verified_primary_email;

      expect(userController.findByEmails).toHaveBeenCalledWith(expected);
    });

    it('should return the result of userController.findByEmails', async () => {
      const result = await existingTfmUser.get(MOCK_ENTRA_USER);

      const expected = MOCK_TFM_USER;

      expect(result).toEqual(expected);
    });
  });

  describe('when the provided entra user has a secondary_email', () => {
    const mockEntraUserWithSecondaryEmail = {
      ...MOCK_ENTRA_USER,
      idTokenClaims: {
        ...MOCK_ENTRA_USER.idTokenClaims,
        verified_secondary_email: ['secondary@testing.com'],
      },
    };

    beforeAll(() => {
      jest.resetAllMocks();

      userController.findByEmails = jest.fn().mockResolvedValue(MOCK_TFM_USER);
    });

    it('should call userController.findByEmails with entra user user email', async () => {
      await existingTfmUser.get(mockEntraUserWithSecondaryEmail);

      expect(userController.findByEmails).toHaveBeenCalledTimes(1);

      const { idTokenClaims } = mockEntraUserWithSecondaryEmail;

      const expected = [
        ...idTokenClaims.verified_primary_email,
        ...idTokenClaims.verified_secondary_email,
      ];

      expect(userController.findByEmails).toHaveBeenCalledWith(expected);
    });

    it('should return the result of userController.findByEmails', async () => {
      const result = await existingTfmUser.get(mockEntraUserWithSecondaryEmail);

      const expected = MOCK_TFM_USER;

      expect(result).toEqual(expected);
    });
  });

  describe('when the provided entra user does not have a idTokenClaims property', () => {
    it('should return an empty object', async () => {
      const result = await existingTfmUser.get({});

      expect(result).toEqual({});
    });
  });

  describe('when the no entra user is provided', () => {
    it('should return an empty object', async () => {
      const result = await existingTfmUser.get();

      expect(result).toEqual({});
    });
  });
});
