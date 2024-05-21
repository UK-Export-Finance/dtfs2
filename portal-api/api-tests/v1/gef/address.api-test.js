const app = require('../../../src/createApp');
const { MAKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { POSTCODE } = require('../../fixtures/postcode');
const { geospatialAddresses } = require('../../../src/external-api/api');

const { as, get } = require('../../api')(app);

describe('GET /v1/gef/address/:postcode', () => {
  const aPostcodeAddressUrl = `/v1/gef/address/${POSTCODE.VALID}`;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
  });

  beforeEach(() => {
    geospatialAddresses.getAddressesByPostcode = jest.fn();
    geospatialAddresses.getAddressesByPostcode.mockResolvedValueOnce({ data: { results: [] } });
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(aPostcodeAddressUrl),
    makeRequestWithAuthHeader: (authHeader) => get(aPostcodeAddressUrl, { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [MAKER, READ_ONLY, ADMIN],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
    makeRequestAsUser: (user) => as(user).get(aPostcodeAddressUrl),
    successStatusCode: 200,
  });
});
