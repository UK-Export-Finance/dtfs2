const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const expectedCurrencies = require('../../../src/v1/controllers/currencies/sortedCurrencies')();

const { as } = require('../../api')(app);

describe('/v1/currencies', () => {
  let anEditor;
  let aNonEditor;

  beforeAll( async() => {
    const testUsers = await testUserCache.initialise(app);
    anEditor = testUsers().withRole('editor').one();
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
      expect(body.currencies).toEqual(expectedCurrencies);
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
      const { status, body } = await as(aNonEditor).get(`/v1/currencies/${expectedCurrencies[5].id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectedCurrencies[5]);
    });
  });
});
