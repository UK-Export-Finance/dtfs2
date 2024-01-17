const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withNoRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const { as, get } = require('../../api')(app);

describe('GET /v1/validate', () => {
  const url = '/v1/validate';
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(url),
    makeRequestWithAuthHeader: (authHeader) => get(url, { headers: { Authorization: authHeader } }),
  });

  withNoRoleAuthorisationTests({
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
    makeRequestAsUser: (user) => as(user).get(url),
    successStatusCode: 200,
  });
});
