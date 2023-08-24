const app = require('../../../src/createApp');
const { UKEF_OPERATIONS, MAKER, DATA_ADMIN, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const { as, get } = require('../../api')(app);

// TODO DTFS2-6626: this sends out real API calls to an external API - do we want to prevent this?
describe('/v1/gef/company/:number', () => {
  const aCompanyNumberUrl = '/v1/gef/company/06771815';
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(aCompanyNumberUrl),
    makeRequestWithAuthHeader: (authHeader) => get(aCompanyNumberUrl, { headers: { Authorization: authHeader } })
  });

  withRoleAuthorisationTests({
    allowedRoles: [UKEF_OPERATIONS, MAKER, DATA_ADMIN, ADMIN],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
    makeRequestAsUser: (user) => as(user).get(aCompanyNumberUrl),
    successStatusCode: 200,
  });
});
