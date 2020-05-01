const wipeDB = require('../../wipeDB');
const aCountry = require('./country-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

describe('/v1/countries', () => {
  let noRoles;
  let anEditor;

  const nzl = aCountry({ code: 'NZL', name: 'New Zealand' });
  const hkg = aCountry({ code: 'HKG', name: 'Hong Kong' });
  const dub = aCountry({ code: 'DUB', name: 'Dubai' });
  const gbr = aCountry({ code: 'GBR', name: 'United Kingdom' });

  const newCountry = nzl;
  const updatedCountry = aCountry({ code: 'NZL', name: 'Old Zealand' });

  beforeEach(async () => {
    await wipeDB.wipe(['countries']);

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
      await as(anEditor).postEach([nzl, hkg,dub,gbr]).to('/v1/countries');

      const { status, body } = await as(noRoles).get('/v1/countries');

      const expectedOrder = [gbr, dub, hkg, nzl];

      expect(status).toEqual(200);
      expect(body.countries).toEqual(expectMongoIds(expectedOrder));
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
      await as(anEditor).post(newCountry).to('/v1/countries');

      const { status, body } = await as(noRoles).get('/v1/countries/NZL');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newCountry));
    });
  });

  describe('POST /v1/countries', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newCountry).to('/v1/countries');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(noRoles).post(newCountry).to(
        '/v1/countries',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newCountry).to(
        '/v1/countries',
      );

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/countries/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedCountry).to('/v1/countries/NZL');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newCountry).to('/v1/countries');

      const { status } = await as(noRoles).put(updatedCountry).to('/v1/countries/NZL');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newCountry, anEditor).to('/v1/countries');

      const { status } = await as(anEditor).put(updatedCountry).to('/v1/countries/NZL');

      expect(status).toEqual(200);
    });

    it('updates the country', async () => {
      await as(anEditor).post(newCountry).to('/v1/countries');
      await as(anEditor).put(updatedCountry).to('/v1/countries/NZL');

      const { status, body } = await as(anEditor).get('/v1/countries/NZL');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedCountry));
    });
  });

  describe('DELETE /v1/countries/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/countries/NZL');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newCountry).to('/v1/countries');

      const { status } = await as(noRoles).remove('/v1/countries/NZL');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newCountry).to('/v1/countries');

      const { status } = await as(anEditor).remove('/v1/countries/NZL');

      expect(status).toEqual(200);
    });

    it('deletes the country', async () => {
      await as(anEditor).post(newCountry).to('/v1/countries');
      await as(anEditor).remove('/v1/countries/NZL');
      
      const { status, body } = await as(anEditor).get('/v1/countries/NZL');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
