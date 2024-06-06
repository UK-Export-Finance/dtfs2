const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withNoRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const { as, get } = require('../../api')(app);

jest.mock('../../../src/external-api/api', () => ({
  bankHolidays: {
    getBankHolidays: () => ({ status: 200 }),
  },
}));

describe('/v1/bank-holidays', () => {
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
  });

  describe('GET /v1/bank-holidays', () => {
    const urlToGetBankHolidays = '/v1/bank-holidays';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetBankHolidays),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetBankHolidays, { headers: { Authorization: authHeader } }),
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(urlToGetBankHolidays),
      successStatusCode: 200,
    });
  });
});
