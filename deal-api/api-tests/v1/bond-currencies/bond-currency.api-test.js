const wipeDB = require('../../wipeDB');
const aBondCurrency = require('./bond-currency-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const getToken = require('../../getToken')(app);

describe('/v1/bond-currencies', () => {
  const usd = aBondCurrency({ id: 'USD', name: 'USD - US Dollars' });
  const gbp = aBondCurrency({ id: 'GBP', name: 'GBP - UK Sterling' });
  const cad = aBondCurrency({ id: 'CAD', name: 'CAD - Canadian Dollars' });

  const newCurrency = usd;
  const updatedCurrency = aBondCurrency({ id: 'USD', name: 'USD - US Denari' });

  let aTokenWithNoRoles;
  let aTokenWithEditorRole;

  beforeEach(async () => {
    await wipeDB();

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

  describe('GET /v1/bond-currencies', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/bond-currencies');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await get('/v1/bond-currencies', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a list of bond-currencies, alphebetized', async () => {
      await post(gbp, aTokenWithEditorRole).to('/v1/bond-currencies');
      await post(usd, aTokenWithEditorRole).to('/v1/bond-currencies');
      await post(cad, aTokenWithEditorRole).to('/v1/bond-currencies');

      const { status, body } = await get(
        '/v1/bond-currencies',
        aTokenWithNoRoles,
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
        aTokenWithNoRoles,
      );

      expect(status).toEqual(200);
    });

    it('returns a bond-currency', async () => {
      await post(newCurrency, aTokenWithEditorRole).to('/v1/bond-currencies');

      const { status, body } = await get(
        '/v1/bond-currencies/USD',
        aTokenWithNoRoles,
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
      const { status } = await post(newCurrency, aTokenWithNoRoles).to(
        '/v1/bond-currencies',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await post(newCurrency, aTokenWithEditorRole).to(
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
      await post(newCurrency, aTokenWithEditorRole).to('/v1/bond-currencies');
      const { status } = await put(updatedCurrency, aTokenWithNoRoles).to(
        '/v1/bond-currencies/USD',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCurrency, aTokenWithEditorRole).to('/v1/bond-currencies');
      const { status } = await put(updatedCurrency, aTokenWithEditorRole).to(
        '/v1/bond-currencies/USD',
      );

      expect(status).toEqual(200);
    });

    it('updates the bond-currency', async () => {
      await post(newCurrency, aTokenWithEditorRole).to('/v1/bond-currencies');
      await put(updatedCurrency, aTokenWithEditorRole).to(
        '/v1/bond-currencies/USD',
      );

      const { status, body } = await get(
        '/v1/bond-currencies/USD',
        aTokenWithEditorRole,
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
      await post(newCurrency, aTokenWithEditorRole).to('/v1/bond-currencies');
      const { status } = await remove(
        '/v1/bond-currencies/USD',
        aTokenWithNoRoles,
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newCurrency, aTokenWithEditorRole).to('/v1/bond-currencies');
      const { status } = await remove(
        '/v1/bond-currencies/USD',
        aTokenWithEditorRole,
      );

      expect(status).toEqual(200);
    });

    it('deletes the bond-currency', async () => {
      await post(newCurrency, aTokenWithEditorRole).to('/v1/bond-currencies');
      await remove('/v1/bond-currencies/USD', aTokenWithEditorRole);

      const { status, body } = await get(
        '/v1/bond-currencies/USD',
        aTokenWithEditorRole,
      );

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
