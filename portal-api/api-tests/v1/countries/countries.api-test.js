/**
 * @jest-environment node
 */

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

jest.unmock('../../../src/external-api/api');

describe('/v1/countries', () => {
  let noRoles;
  let aBarclaysMaker;

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
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
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
      expect(body.countries.length).toBeGreaterThan(1);
      expect(body.countries[0]).toEqual(gbr);

      for (let i = 2; i < body.countries.length; i += 1) {
        expect(body.countries[i - 1].name < body.countries[i].name).toBe(true);
      }
    });
  });

  describe('GET /v1/countries/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/countries/GBR');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token and returns country', async () => {
      const { status, body } = await as(noRoles).get('/v1/countries/GBR');
      expect(status).toEqual(200);
      expect(body).toEqual(gbr);
    });

    it('accepts requests for "Abu Dhabi" returns country', async () => {
      const { status, body } = await as(noRoles).get('/v1/countries/XAD');
      expect(status).toEqual(200);
      expect(body).toEqual(abuDhabi);
    });

    it('accepts requests for "Dubai" returns country', async () => {
      const { status, body } = await as(noRoles).get('/v1/countries/XDB');
      expect(status).toEqual(200);
      expect(body).toEqual(dubai);
    });

    it('returns 404 when country doesn\'t exist', async () => {
      const { status } = await as(noRoles).get('/v1/countries/ABC');

      expect(status).toEqual(404);
    });

    it('returns 400 when country id is invalid', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/countries/A12');

      expect(status).toEqual(400);
    });
  });
});
