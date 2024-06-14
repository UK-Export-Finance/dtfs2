/**
 * @jest-environment node
 */

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');

const { as, get } = require('../../api')(app);

jest.unmock('../../../src/external-api/api');

describe('/v1/countries', () => {
  let testUsers;
  let testUser;

  const gbr = {
    id: 826,
    name: 'United Kingdom',
    code: 'GBR',
  };

  const abuDhabi = {
    id: 900,
    name: 'Abu Dhabi',
    code: 'XAD',
  };

  const dubai = {
    id: 904,
    name: 'Dubai',
    code: 'XDB',
  };

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    testUser = testUsers().one();
  });

  describe('GET /v1/countries', () => {
    const urlToGetCountries = '/v1/countries';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetCountries),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetCountries, { headers: { Authorization: authHeader } }),
    });

    it('returns a list of countries, alphabetised but with GBR/United Kingdom at the top', async () => {
      const { status, body } = await as(testUser).get(urlToGetCountries);

      expect(status).toEqual(200);
      expect(body.countries.length).toBeGreaterThan(1);
      expect(body.countries[0]).toEqual(gbr);

      for (let i = 2; i < body.countries.length; i += 1) {
        expect(body.countries[i - 1].name < body.countries[i].name).toBe(true);
      }
    });
  });

  describe('GET /v1/countries/:code', () => {
    const urlToGetGbrCountry = '/v1/countries/GBR';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(urlToGetGbrCountry),
      makeRequestWithAuthHeader: (authHeader) => get(urlToGetGbrCountry, { headers: { Authorization: authHeader } }),
    });

    it('returns the country for "United Kingdom"', async () => {
      const { status, body } = await as(testUser).get('/v1/countries/GBR');
      expect(status).toEqual(200);
      expect(body).toEqual(gbr);
    });

    it('returns the country for "Abu Dhabi"', async () => {
      const { status, body } = await as(testUser).get('/v1/countries/XAD');
      expect(status).toEqual(200);
      expect(body).toEqual(abuDhabi);
    });

    it('returns the country for "Dubai"', async () => {
      const { status, body } = await as(testUser).get('/v1/countries/XDB');
      expect(status).toEqual(200);
      expect(body).toEqual(dubai);
    });

    it("returns 404 when country doesn't exist", async () => {
      const { status } = await as(testUser).get('/v1/countries/ABC');

      expect(status).toEqual(404);
    });

    it('returns 400 when country id is invalid', async () => {
      const { status } = await as(testUser).get('/v1/countries/A12');

      expect(status).toEqual(400);
    });
  });
});
