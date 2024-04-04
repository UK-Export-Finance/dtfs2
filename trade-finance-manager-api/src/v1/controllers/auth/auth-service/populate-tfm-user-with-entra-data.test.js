const populateTfmUserWithEntraData = require('./populate-tfm-user-with-entra-data');
const mapEntraUserData = require('./map-entra-user-data');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');
const MOCK_TFM_USERS = require('../../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

describe('auth-service/populate-tfm-user-with-entra-data', () => {
  it('returns TFM and mapped entra user data', () => {
    const result = populateTfmUserWithEntraData({user: MOCK_TFM_USER}, MOCK_ENTRA_USER);

    const expected = {
      user: {
        ...MOCK_TFM_USER,
        ...mapEntraUserData(MOCK_ENTRA_USER, MOCK_TFM_USER),
      }
    };

    expect(result).toEqual(expected);
  });
});
