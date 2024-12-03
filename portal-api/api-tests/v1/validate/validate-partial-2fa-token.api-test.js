const app = require('../../../src/createApp');
const { createPartiallyLoggedInUserSession } = require('../../../test-helpers/api-test-helpers/database/user-repository');
const testUserCache = require('../../api-test-users');
const { withPartial2FaOnlyAuthenticationTests } = require('../../common-tests/client-authentication-tests');

const { get } = require('../../api')(app);

const url = '/v1/validate-partial-2fa-token';

describe(`GET ${url}`, () => {
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
  });

  withPartial2FaOnlyAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(url),
    makeRequestWithAuthHeader: (authHeader) => get(url, { headers: { Authorization: authHeader } }),
    get2faCompletedUserToken: () => testUsers().one().token,
  });

  it('returns a 200 response if the request has an Authorization header with a partial 2fa token', async () => {
    const { token } = await createPartiallyLoggedInUserSession(testUsers().one());

    const { status } = await get(url, { headers: { Authorization: token } });

    expect(status).toEqual(200);
  });
});
