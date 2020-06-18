const wipeDB = require('../../wipeDB');
const aCurrency = require('./currency-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const usd = aCurrency({ id: 'USD', text: 'USD - US Dollars' });
const gbp = aCurrency({ id: 'GBP', text: 'GBP - UK Sterling' });
const cad = aCurrency({ id: 'CAD', text: 'CAD - Canadian Dollars' });

const newCurrency = usd;
const updatedCurrency = aCurrency({ id: 'USD', text: 'USD - US Denari' });

describe('/v1/currencies', () => {
  let anEditor;
  let aNonEditor;

  beforeAll( async() => {
    const testUsers = await testUserCache.initialise(app);
    anEditor = testUsers().withRole('editor').one();
    aNonEditor = testUsers().withoutRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['currencies']);
  });

  describe('GET /v1/currencies', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/currencies');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(aNonEditor).get('/v1/currencies');

      expect(status).toEqual(200);
    });

    it('returns a list of currencies, alphebetized', async () => {
      await as(anEditor).postEach([gbp, usd, cad]).to('/v1/currencies');

      const { status, body } = await as(aNonEditor).get('/v1/currencies', aNonEditor.token);

      const expectedOrder = [cad, gbp, usd];

      expect(status).toEqual(200);
      expect(body.currencies).toEqual(expectMongoIds(expectedOrder));
    });
  });

  describe('GET /v1/currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/currencies/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(aNonEditor).get('/v1/currencies/123');

      expect(status).toEqual(200);
    });

    it('returns a currency', async () => {
      await as(anEditor).post(newCurrency).to('/v1/currencies');

      const { status, body } = await as(aNonEditor).get('/v1/currencies/USD');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newCurrency));
    });
  });

  describe('POST /v1/currencies', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newCurrency).to('/v1/currencies');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(aNonEditor).post(newCurrency).to('/v1/currencies');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newCurrency).to('/v1/currencies');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedCurrency).to('/v1/currencies/USD');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newCurrency).to('/v1/currencies');
      const { status } = await as(aNonEditor).put(updatedCurrency).to('/v1/currencies/USD');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newCurrency).to('/v1/currencies');
      const { status } = await as(anEditor).put(updatedCurrency).to('/v1/currencies/USD');

      expect(status).toEqual(200);
    });

    it('updates the currency', async () => {
      await as(anEditor).post(newCurrency).to('/v1/currencies');
      await as(anEditor).put(updatedCurrency).to('/v1/currencies/USD');

      const { status, body } = await as(anEditor).get('/v1/currencies/USD');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedCurrency));
    });
  });

  describe('DELETE /v1/currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/currencies/USD');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newCurrency).to('/v1/currencies');
      const { status } = await as(aNonEditor).remove('/v1/currencies/USD');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newCurrency).to('/v1/currencies');
      const { status } = await as(anEditor).remove('/v1/currencies/USD');

      expect(status).toEqual(200);
    });

    it('deletes the currency', async () => {
      await as(anEditor).post(newCurrency).to('/v1/currencies');
      await as(anEditor).remove('/v1/currencies/USD');

      const { status, body } = await as(anEditor).get('/v1/currencies/USD');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
