const wipeDB = require('../../wipeDB');
const aBondCurrency = require('./bond-currency-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const usd = aBondCurrency({ id: 'USD', text: 'USD - US Dollars' });
const gbp = aBondCurrency({ id: 'GBP', text: 'GBP - UK Sterling' });
const cad = aBondCurrency({ id: 'CAD', text: 'CAD - Canadian Dollars' });

const newCurrency = usd;
const updatedCurrency = aBondCurrency({ id: 'USD', text: 'USD - US Denari' });

describe('/v1/bond-currencies', () => {
  let anEditor;
  let aNonEditor;

  beforeAll( async() => {
    const testUsers = await testUserCache.initialise(app);
    anEditor = testUsers().withRole('editor').one();
    aNonEditor = testUsers().withoutRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['bondCurrencies']);
  });

  describe('GET /v1/bond-currencies', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/bond-currencies');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(aNonEditor).get('/v1/bond-currencies');

      expect(status).toEqual(200);
    });

    it('returns a list of bond-currencies, alphebetized', async () => {
      await as(anEditor).postEach([gbp, usd, cad]).to('/v1/bond-currencies');

      const { status, body } = await as(aNonEditor).get('/v1/bond-currencies', aNonEditor.token);

      const expectedOrder = [cad, gbp, usd];

      expect(status).toEqual(200);
      expect(body.bondCurrencies).toEqual(expectMongoIds(expectedOrder));
    });
  });

  describe('GET /v1/bond-currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/bond-currencies/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(aNonEditor).get('/v1/bond-currencies/123');

      expect(status).toEqual(200);
    });

    it('returns a bond-currency', async () => {
      await as(anEditor).post(newCurrency).to('/v1/bond-currencies');

      const { status, body } = await as(aNonEditor).get('/v1/bond-currencies/USD');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newCurrency));
    });
  });

  describe('POST /v1/bond-currencies', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newCurrency).to('/v1/bond-currencies');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(aNonEditor).post(newCurrency).to('/v1/bond-currencies');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newCurrency).to('/v1/bond-currencies');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/bond-currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedCurrency).to('/v1/bond-currencies/USD');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newCurrency).to('/v1/bond-currencies');
      const { status } = await as(aNonEditor).put(updatedCurrency).to('/v1/bond-currencies/USD');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newCurrency).to('/v1/bond-currencies');
      const { status } = await as(anEditor).put(updatedCurrency).to('/v1/bond-currencies/USD');

      expect(status).toEqual(200);
    });

    it('updates the bond-currency', async () => {
      await as(anEditor).post(newCurrency).to('/v1/bond-currencies');
      await as(anEditor).put(updatedCurrency).to('/v1/bond-currencies/USD');

      const { status, body } = await as(anEditor).get('/v1/bond-currencies/USD');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedCurrency));
    });
  });

  describe('DELETE /v1/bond-currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/bond-currencies/USD');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newCurrency).to('/v1/bond-currencies');
      const { status } = await as(aNonEditor).remove('/v1/bond-currencies/USD');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newCurrency).to('/v1/bond-currencies');
      const { status } = await as(anEditor).remove('/v1/bond-currencies/USD');

      expect(status).toEqual(200);
    });

    it('deletes the bond-currency', async () => {
      await as(anEditor).post(newCurrency).to('/v1/bond-currencies');
      await as(anEditor).remove('/v1/bond-currencies/USD');

      const { status, body } = await as(anEditor).get('/v1/bond-currencies/USD');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
