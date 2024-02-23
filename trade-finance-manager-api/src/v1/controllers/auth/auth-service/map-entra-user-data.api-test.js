const mapEntraUserData = require('./map-entra-user-data');
const { getTfmRolesFromEntraGroups } = require('../../../helpers/entra-group-to-tfm-role');
const { mapFirstAndLastName } = require('./map-first-and-last-name');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');

describe('auth-service/map-entra-user-data', () => {
  it('returns a user mapped with Entra/TFM roles, firstName and lastName', () => {
    const result = mapEntraUserData(MOCK_ENTRA_USER);

    const {
      oid,
      email,
      groups,
    } = MOCK_ENTRA_USER.idTokenClaims;

    const expected = {
      azureOid: oid,
      email,
      username: email,
      teams: getTfmRolesFromEntraGroups(groups),
      timezone: 'Europe/London',
      ...mapFirstAndLastName(MOCK_ENTRA_USER.idTokenClaims),
    };

    expect(result).toEqual(expected);
  });
});
