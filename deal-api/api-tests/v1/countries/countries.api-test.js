const wipeDB = require('../../wipeDB');
const aCountry = require('./country-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { get, post, put, remove } = require('../../api')(app);
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
      const { status } = await get('/v1/countries');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await get('/v1/countries', noRoles.token);

      expect(status).toEqual(200);
    });

    it('returns a list of countries, alphebetized but with GBR/United Kingdom at the top', async () => {
      await post(nzl, anEditor.token).to('/v1/countries');
      await post(hkg, anEditor.token).to('/v1/countries');
      await post(dub, anEditor.token).to('/v1/countries');
      await post(gbr, anEditor.token).to('/v1/countries');

      const { status, body } = await get('/v1/countries', noRoles.token);

      const expectedOrder = [gbr, dub, hkg, nzl];

      expect(status).toEqual(200);
      expect(body.countries).toEqual(expectMongoIds(expectedOrder));
    });
  });

  describe('GET /v1/countries/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/countries/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await get('/v1/countries/123', noRoles.token);

      expect(status).toEqual(200);
    });

    it('returns a country', async () => {
      await post(newCountry, anEditor.token).to('/v1/countries');

      const { status, body } = await get(
        '/v1/countries/NZL',
        noRoles.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newCountry));
    });
  });

  describe('POST /v1/countries', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await post(newCountry).to('/v1/countries');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await post(newCountry, noRoles.token).to(
        '/v1/countries',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await post(newCountry, anEditor.token).to(
        '/v1/countries',
      );

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/countries/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await put(updatedCountry).to('/v1/countries/NZL');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newCountry, anEditor.token).to('/v1/countries');
      const { status } = await put(updatedCountry, noRoles.token).to(
        '/v1/countries/NZL',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCountry, anEditor.token).to('/v1/countries');
      const { status } = await put(updatedCountry, anEditor.token).to(
        '/v1/countries/NZL',
      );

      expect(status).toEqual(200);
    });

    it('updates the country', async () => {
      await post(newCountry, anEditor.token).to('/v1/countries');
      await put(updatedCountry, anEditor.token).to('/v1/countries/NZL');

      const { status, body } = await get(
        '/v1/countries/NZL',
        anEditor.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedCountry));
    });
  });

  describe('DELETE /v1/countries/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await remove('/v1/countries/NZL');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newCountry, anEditor.token).to('/v1/countries');
      const { status } = await remove('/v1/countries/NZL', noRoles.token);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCountry, anEditor.token).to('/v1/countries');
      const { status } = await remove(
        '/v1/countries/NZL',
        anEditor.token,
      );

      expect(status).toEqual(200);
    });

    it('deletes the country', async () => {
      await post(newCountry, anEditor.token).to('/v1/countries');
      await remove('/v1/countries/NZL', anEditor.token);

      const { status, body } = await get(
        '/v1/countries/NZL',
        anEditor.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
