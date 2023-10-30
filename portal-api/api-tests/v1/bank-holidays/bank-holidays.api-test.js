/**
 * @jest-environment node
 */

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withNoRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const { as, get } = require('../../api')(app);

jest.unmock('../../../src/external-api/api');

describe('/v1/bank-holidays', () => {
  let noRoles;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
  });

  describe('GET /v1/bank-holidays', () => {
    const urlToGetBankHolidays = '/v1/bank-holidays';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetBankHolidays),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetBankHolidays, { headers: { Authorization: authHeader } })
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).get(urlToGetBankHolidays),
      successStatusCode: 200,
    });
  });
});
