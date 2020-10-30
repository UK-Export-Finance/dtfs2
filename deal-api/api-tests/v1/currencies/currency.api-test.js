const wipeDB = require('../../wipeDB');
const aCurrency = require('./currency-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const usd = aCurrency({ id: 'USD', text: 'USD - US Dollars' });
const gbp = aCurrency({ id: 'GBP', text: 'GBP - UK Sterling' });
const cad = aCurrency({ id: 'CAD', text: 'CAD - Canadian Dollars' });

describe('/v1/currencies', () => {
  let aNonEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aNonEditor = testUsers().withoutRole('editor').one();
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
      const { status, body } = await as(aNonEditor).get('/v1/currencies', aNonEditor.token);

      expect(status).toEqual(200);
      expect(body.currencies.length).toBeGreaterThan(1);
      for (let i = 1; i < body.currencies.length; i += 1) {
        expect(body.currencies[i - 1].id < body.currencies[i].id).toBe(true);
      }
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
      const { status, body } = await as(aNonEditor).get('/v1/currencies/USD');

      expect(status).toEqual(200);
      expect(body).toMatchObject(usd);
    });
  });
});
