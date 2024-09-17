const { LONDON_TIMEZONE } = require('@ukef/dtfs2-common');
const mapEntraUserData = require('./map-entra-user-data');
const { getTfmRolesFromEntraGroups } = require('../../../helpers/get-tfm-roles-from-entra-groups');
const { mapFirstAndLastName } = require('./map-first-and-last-name');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');

describe('auth-service/map-entra-user-data', () => {
  it('returns a user mapped with Entra/TFM roles, firstName and lastName', () => {
    const result = mapEntraUserData(MOCK_ENTRA_USER);

    const { oid, email, groups } = MOCK_ENTRA_USER.idTokenClaims;

    const expected = {
      azureOid: oid,
      email,
      username: email,
      teams: getTfmRolesFromEntraGroups(groups),
      timezone: LONDON_TIMEZONE,
      ...mapFirstAndLastName(MOCK_ENTRA_USER.idTokenClaims),
    };

    expect(result).toEqual(expected);
  });
});
