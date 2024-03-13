const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withNoRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const externalApi = require('../../../src/external-api/api');

const { as, get } = require('../../api')(app);

describe('/v1/bank-holidays', () => {
  let noRoles;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const externalApiBankHolidaySpy = jest.spyOn(externalApi, 'bankHolidays');

  beforeEach(() => {
    externalApiBankHolidaySpy.mockReturnValue({
      getBankHolidays: () => ({ status: 200 }),
    });
  });

  describe('GET /v1/bank-holidays', () => {
    const urlToGetBankHolidays = '/v1/bank-holidays';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetBankHolidays),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetBankHolidays, { headers: { Authorization: authHeader } }),
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).get(urlToGetBankHolidays),
      successStatusCode: 200,
    });
  });
});
