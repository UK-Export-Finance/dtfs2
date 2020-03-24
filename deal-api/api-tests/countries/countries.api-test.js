const wipeDB = require('../wipeDB');
const aCountry = require('./country-builder');

const app = require('../../src/createApp');
const { get, post, put, remove } = require('../api')(app);
const { expectMongoId, expectMongoIds} = require('../expectMongoIds');

const getToken = require('../getToken')(app);

describe('/api/countries', () => {
  const nzl = aCountry({ code: 'NZL', name: 'New Zealand'});
  const hkg = aCountry({ code: 'HKG', name: 'Hong Kong'});
  const dub = aCountry({ code: 'DUB', name: 'Dubai'});
  const gbr = aCountry({ code: 'GBR', name: 'United Kingdom'});

  const newCountry = nzl;
  const updatedCountry = aCountry({code: 'NZL', name: 'Old Zealand'});

  let aTokenWithNoRoles;
  let aTokenWithEditorRole;

  beforeEach(async () => {
    await wipeDB();

    aTokenWithNoRoles    = await getToken({username:'1',password:'2',roles:[]});
    aTokenWithEditorRole = await getToken({username:'3',password:'4',roles:['editor']});
  });

  describe('GET /api/countries', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/countries');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const {status} = await get('/api/countries', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a list of countries, alphebetized but with GBR/United Kingdom at the top', async () => {
      await post(nzl, aTokenWithEditorRole).to('/api/countries');
      await post(hkg, aTokenWithEditorRole).to('/api/countries');
      await post(dub, aTokenWithEditorRole).to('/api/countries');
      await post(gbr, aTokenWithEditorRole).to('/api/countries');

      const {status, body} = await get('/api/countries', aTokenWithNoRoles);

      const expectedOrder = [gbr, dub, hkg, nzl];

      expect(status).toEqual(200);
      expect(body.countries).toEqual(expectMongoIds(expectedOrder));
    });
  });

  describe('GET /api/countries/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/countries/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const {status} = await get('/api/countries/123', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a country', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/api/countries');

      const {status, body} = await get('/api/countries/NZL', aTokenWithNoRoles);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newCountry));
    });

  });

  describe('POST /api/countries', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await post(newCountry).to('/api/countries');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const {status} = await post(newCountry, aTokenWithNoRoles).to('/api/countries');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const {status} = await post(newCountry, aTokenWithEditorRole).to('/api/countries');

      expect(status).toEqual(200);
    });

  });

  describe('PUT /api/countries/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await put(updatedCountry).to('/api/countries/NZL');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/api/countries');
      const {status} = await put(updatedCountry, aTokenWithNoRoles).to('/api/countries/NZL');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/api/countries');
      const {status} = await put(updatedCountry, aTokenWithEditorRole).to('/api/countries/NZL');

      expect(status).toEqual(200);
    });

    it('updates the country', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/api/countries');
      await put(updatedCountry, aTokenWithEditorRole).to('/api/countries/NZL');

      const {status, body} = await get('/api/countries/NZL', aTokenWithEditorRole);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedCountry));
    });
  });

  describe('DELETE /api/countries/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await remove('/api/countries/NZL');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/api/countries');
      const {status} = await remove('/api/countries/NZL', aTokenWithNoRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/api/countries');
      const {status} = await remove('/api/countries/NZL', aTokenWithEditorRole);

      expect(status).toEqual(200);
    });

    it('deletes the country', async () => {
      await post(newCountry, aTokenWithEditorRole).to('/api/countries');
      await remove('/api/countries/NZL', aTokenWithEditorRole);

      const {status, body} = await get('/api/countries/NZL', aTokenWithEditorRole);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
