const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

const expectedCountries = require('../../../src/v1/controllers/countries/sortedCountries')();

describe('/v1/countries', () => {
  let noRoles;
  let anEditor;

  beforeEach(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  describe('GET /v1/countries', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/countries');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/countries');

      expect(status).toEqual(200);
    });

    it('returns a list of countries, alphebetized but with GBR/United Kingdom at the top', async () => {
      const { status, body } = await as(noRoles).get('/v1/countries');

      expect(status).toEqual(200);
      expect(body.countries).toEqual(expectedCountries);
    });
  });

  describe('GET /v1/countries/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/countries/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/countries/123');

      expect(status).toEqual(200);
    });

    it('returns a country', async () => {
      const { status, body } = await as(noRoles).get(`/v1/countries/${expectedCountries[10].code}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectedCountries[10]);
    });
  });

});
