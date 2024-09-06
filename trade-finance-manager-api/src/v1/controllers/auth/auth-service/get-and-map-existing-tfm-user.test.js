const tfmUser = require('./get-existing-tfm-user');
const existingTfmUser = require('./get-and-map-existing-tfm-user');
const populateTfmUserWithEntraData = require('./populate-tfm-user-with-entra-data');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');
const MOCK_TFM_USERS = require('../../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

describe('auth-service/get-and-map-existing-tfm-user', () => {
  beforeAll(() => {
    tfmUser.get = jest.fn().mockResolvedValue(MOCK_TFM_USER);
  });

  it('should call tfmUser.get with the provided Entra user', async () => {
    await existingTfmUser.getAndMap(MOCK_ENTRA_USER);

    expect(tfmUser.get).toHaveBeenCalledTimes(1);
    expect(tfmUser.get).toHaveBeenCalledWith(MOCK_ENTRA_USER);
  });

  describe('when an Entra user is not provided', () => {
    it('should return an empty object', async () => {
      const result = await existingTfmUser.getAndMap();

      expect(result).toEqual({});
    });
  });

  it('should return a mapped TFM user', async () => {
    const result = await existingTfmUser.getAndMap(MOCK_ENTRA_USER);

    const expected = populateTfmUserWithEntraData(MOCK_TFM_USER, MOCK_ENTRA_USER);

    expect(result).toEqual(expected);
  });
});
