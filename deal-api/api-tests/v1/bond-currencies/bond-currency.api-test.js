const wipeDB = require('../../wipeDB');
const aBondCurrency = require('./bond-currency-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { get, post, put, remove } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

describe('/v1/bond-currencies', () => {
  const usd = aBondCurrency({ id: 'USD', text: 'USD - US Dollars' });
  const gbp = aBondCurrency({ id: 'GBP', text: 'GBP - UK Sterling' });
  const cad = aBondCurrency({ id: 'CAD', text: 'CAD - Canadian Dollars' });

  const newCurrency = usd;
  const updatedCurrency = aBondCurrency({ id: 'USD', text: 'USD - US Denari' });

  let anEditor;
  let aNonEditor;

  beforeEach(async () => {
    await wipeDB.wipe(['bondCurrencies']);

    const testUsers = await testUserCache.initialise(app);
    anEditor = testUsers().withRole('editor').one();
    aNonEditor = testUsers().withoutRole('editor').one();
  });

  describe('GET /v1/bond-currencies', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/bond-currencies');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await get('/v1/bond-currencies', aNonEditor.token);

      expect(status).toEqual(200);
    });

    it('returns a list of bond-currencies, alphebetized', async () => {
      await post(gbp, anEditor.token).to('/v1/bond-currencies');
      await post(usd, anEditor.token).to('/v1/bond-currencies');
      await post(cad, anEditor.token).to('/v1/bond-currencies');

      const { status, body } = await get(
        '/v1/bond-currencies',
        aNonEditor.token,
      );

      const expectedOrder = [cad, gbp, usd];

      expect(status).toEqual(200);
      expect(body.bondCurrencies).toEqual(expectMongoIds(expectedOrder));
    });
  });

  describe('GET /v1/bond-currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/bond-currencies/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await get(
        '/v1/bond-currencies/123',
        aNonEditor.token,
      );

      expect(status).toEqual(200);
    });

    it('returns a bond-currency', async () => {
      await post(newCurrency, anEditor.token).to('/v1/bond-currencies');

      const { status, body } = await get(
        '/v1/bond-currencies/USD',
        aNonEditor.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newCurrency));
    });
  });

  describe('POST /v1/bond-currencies', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await post(newCurrency).to('/v1/bond-currencies');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await post(newCurrency, aNonEditor.token).to(
        '/v1/bond-currencies',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await post(newCurrency, anEditor.token).to(
        '/v1/bond-currencies',
      );

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/bond-currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await put(updatedCurrency).to(
        '/v1/bond-currencies/USD',
      );

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newCurrency, anEditor.token).to('/v1/bond-currencies');
      const { status } = await put(updatedCurrency, aNonEditor.token).to(
        '/v1/bond-currencies/USD',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCurrency, anEditor.token).to('/v1/bond-currencies');
      const { status } = await put(updatedCurrency, anEditor.token).to(
        '/v1/bond-currencies/USD',
      );

      expect(status).toEqual(200);
    });

    it('updates the bond-currency', async () => {
      await post(newCurrency, anEditor.token).to('/v1/bond-currencies');
      await put(updatedCurrency, anEditor.token).to(
        '/v1/bond-currencies/USD',
      );

      const { status, body } = await get(
        '/v1/bond-currencies/USD',
        anEditor.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedCurrency));
    });
  });

  describe('DELETE /v1/bond-currencies/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await remove('/v1/bond-currencies/USD');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newCurrency, anEditor.token).to('/v1/bond-currencies');
      const { status } = await remove(
        '/v1/bond-currencies/USD',
        aNonEditor.token,
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCurrency, anEditor.token).to('/v1/bond-currencies');
      const { status } = await remove(
        '/v1/bond-currencies/USD',
        anEditor.token,
      );

      expect(status).toEqual(200);
    });

    it('deletes the bond-currency', async () => {
      await post(newCurrency, anEditor.token).to('/v1/bond-currencies');
      await remove('/v1/bond-currencies/USD', anEditor.token);

      const { status, body } = await get(
        '/v1/bond-currencies/USD',
        anEditor.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
