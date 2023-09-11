const app = require('../../../src/createApp');
const { MAKER, DATA_ADMIN, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { COMPANIES_HOUSE_NUMBER } = require('../../fixtures/companies-house-number');

const { as, get } = require('../../api')(app);

// TODO DTFS2-6626: this sends out real API calls to an external API - do we want to prevent this?
describe('GET /v1/gef/company/:number', () => {
  const aCompanyNumberUrl = `/v1/gef/company/${COMPANIES_HOUSE_NUMBER.VALID}`;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(aCompanyNumberUrl),
    makeRequestWithAuthHeader: (authHeader) => get(aCompanyNumberUrl, { headers: { Authorization: authHeader } })
  });

  withRoleAuthorisationTests({
    allowedRoles: [MAKER, DATA_ADMIN, READ_ONLY, ADMIN],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
    makeRequestAsUser: (user) => as(user).get(aCompanyNumberUrl),
    successStatusCode: 200,
  });
});
