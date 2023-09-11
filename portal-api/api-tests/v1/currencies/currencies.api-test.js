/**
 * @jest-environment node
 */

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withNoRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const { as, get } = require('../../api')(app);

jest.unmock('../../../src/external-api/api');

const usd = {
  currencyId: 37,
  text: 'USD - US Dollars',
  id: 'USD',
};

describe('/v1/currencies', () => {
  let aNonEditor;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aNonEditor = testUsers().withoutRole('editor').one();
  });

  describe('GET /v1/currencies', () => {
    const urlToGetCurrencies = '/v1/currencies';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetCurrencies),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetCurrencies, { headers: { Authorization: authHeader } })
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(urlToGetCurrencies),
      successStatusCode: 200,
    });

    it('returns a list of currencies, alphabetized', async () => {
      const { status, body } = await as(aNonEditor).get(urlToGetCurrencies);

      expect(status).toEqual(200);
      expect(body.currencies.length).toBeGreaterThan(1);
      for (let i = 1; i < body.currencies.length; i += 1) {
        expect(body.currencies[i - 1].id < body.currencies[i].id).toBe(true);
      }
    });
  });

  describe('GET /v1/currencies/:id', () => {
    const urlToGetUsdCurrency = '/v1/currencies/USD';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetUsdCurrency),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetUsdCurrency, { headers: { Authorization: authHeader } })
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(urlToGetUsdCurrency),
      successStatusCode: 200,
    });

    it('returns a currency', async () => {
      const { status, body } = await as(aNonEditor).get(urlToGetUsdCurrency);

      expect(status).toEqual(200);
      expect(body).toMatchObject(usd);
    });

    it('returns 400 when currency doesn\'t exist', async () => {
      const { status } = await as(aNonEditor).get('/v1/currencies/AAA');

      expect(status).toEqual(400);
    });

    it('returns 400 when currency is invalid', async () => {
      const { status } = await as(aNonEditor).get('/v1/currencies/AB1');

      expect(status).toEqual(400);
    });
  });
});
