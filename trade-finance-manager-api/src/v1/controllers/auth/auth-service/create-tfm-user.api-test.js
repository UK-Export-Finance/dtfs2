const createTfmUser = require('./create-tfm-user');
const mapEntraUserData = require('./map-entra-user-data');
const userController = require('../../user/user.controller');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');

describe('auth-service/create-tfm-user', () => {
  const mockCreatedUser = { created: true };

  beforeAll(() => {
    userController.createUser = jest.fn().mockResolvedValue(mockCreatedUser);
  });

  it('should call userController.createUser with mapEntraUserData', async () => {
    await createTfmUser(MOCK_ENTRA_USER);

    expect(userController.createUser).toHaveBeenCalledTimes(1);

    const mappedUser = mapEntraUserData(MOCK_ENTRA_USER);

    expect(userController.createUser).toHaveBeenCalledWith(mappedUser);
  });

  it('should return the response of userController.createUser', async () => {
    const result = await createTfmUser(MOCK_ENTRA_USER);

    expect(result).toEqual(mockCreatedUser);
  });
});
