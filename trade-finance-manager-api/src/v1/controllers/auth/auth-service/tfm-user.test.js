const { create, update } = require('./tfm-user');
const mapEntraUserData = require('./map-entra-user-data');
const userController = require('../../user/user.controller');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');
const MOCK_TFM_USERS = require('../../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

describe('auth-service/tfm-user', () => {
  describe('create', () => {
    let result;

    beforeEach(async () => {
      userController.createUser = jest.fn().mockResolvedValue(MOCK_TFM_USER);

      result = await create(MOCK_ENTRA_USER);
    });

    it('should call userController.createUser with mapped Entra data', () => {
      expect(userController.createUser).toHaveBeenCalledTimes(1);

      const expectedData = mapEntraUserData(MOCK_ENTRA_USER);

      expect(userController.createUser).toHaveBeenCalledWith(expectedData);
    });

    it('should return the created user', () => {
      expect(result).toEqual(MOCK_TFM_USER);
    });
  });

  describe('update', () => {
    let result;

    const mockUpdatedUser = {
      ...MOCK_TFM_USER,
      updated: true,
    };

    beforeEach(async () => {
      userController.updateUser = jest.fn().mockResolvedValue(mockUpdatedUser);

      result = await update(MOCK_TFM_USER._id, MOCK_ENTRA_USER);
    });

    it('should call userController.updateUser with mapped Entra data', () => {
      expect(userController.updateUser).toHaveBeenCalledTimes(1);

      const expectedData = mapEntraUserData(MOCK_ENTRA_USER);

      expect(userController.updateUser).toHaveBeenCalledWith(MOCK_TFM_USER._id, expectedData);
    });

    it('should return the updated user', () => {
      expect(result).toEqual(mockUpdatedUser);
    });
  });
});
