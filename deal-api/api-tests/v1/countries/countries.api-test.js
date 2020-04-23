const wipeDB = require('../../wipeDB');
const aCountry = require('./country-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const getToken = require('../../getToken')(app);

describe('/v1/countries', () => {
  const nzl = aCountry({ code: 'NZL', name: 'New Zealand' });
  const hkg = aCountry({ code: 'HKG', name: 'Hong Kong' });
  const dub = aCountry({ code: 'DUB', name: 'Dubai' });
  const gbr = aCountry({ code: 'GBR', name: 'United Kingdom' });

  const newCountry = nzl;
  const updatedCountry = aCountry({ code: 'NZL', name: 'Old Zealand' });

  let aTokenWithNoRoles;
  let aTokenWithEditorRole;

  beforeEach(async () => {
    await wipeDB.wipe(['countries', 'users']);

    aTokenWithNoRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });
    aTokenWithEditorRole = await getToken({
      username: '3',
      password: '4',
      roles: ['editor'],
    });
  });

  describe('GET /v1/countries', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/countries');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await get('/v1/countries', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a list of countries, alphebetized but with GBR/United Kingdom at the top', async () => {
      await post(nzl, aTokenWithEditorRole).to('/v1/countries');
      await post(hkg, aTokenWithEditorRole).to('/v1/countries');
      await post(dub, aTokenWithEditorRole).to('/v1/countries');
      await post(gbr, aTokenWithEditorRole).to('/v1/countries');

      const { status, body } = await get('/v1/countries', aTokenWithNoRoles);

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
      const { status } = await get('/v1/countries/123', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a country', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/v1/countries');

      const { status, body } = await get(
        '/v1/countries/NZL',
        aTokenWithNoRoles,
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
      const { status } = await post(newCountry, aTokenWithNoRoles).to(
        '/v1/countries',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await post(newCountry, aTokenWithEditorRole).to(
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
      await post(newCountry, aTokenWithEditorRole).to('/v1/countries');
      const { status } = await put(updatedCountry, aTokenWithNoRoles).to(
        '/v1/countries/NZL',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/v1/countries');
      const { status } = await put(updatedCountry, aTokenWithEditorRole).to(
        '/v1/countries/NZL',
      );

      expect(status).toEqual(200);
    });

    it('updates the country', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/v1/countries');
      await put(updatedCountry, aTokenWithEditorRole).to('/v1/countries/NZL');

      const { status, body } = await get(
        '/v1/countries/NZL',
        aTokenWithEditorRole,
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
      await post(newCountry, aTokenWithEditorRole).to('/v1/countries');
      const { status } = await remove('/v1/countries/NZL', aTokenWithNoRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/v1/countries');
      const { status } = await remove(
        '/v1/countries/NZL',
        aTokenWithEditorRole,
      );

      expect(status).toEqual(200);
    });

    it('deletes the country', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/v1/countries');
      await remove('/v1/countries/NZL', aTokenWithEditorRole);

      const { status, body } = await get(
        '/v1/countries/NZL',
        aTokenWithEditorRole,
      );

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
