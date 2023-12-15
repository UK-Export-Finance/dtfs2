const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const databaseHelper = require('../../database-helper');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');
const bankController = require('../../../src/v1/controllers/banks.controller');
const { ADMIN } = require('../../../src/v1/roles/roles');

const aBank = require('./bank-builder');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const newBank = aBank({ id: '112233' });
const updatedBank = aBank({
  id: '112233',
  bankName: 'Updated bank name',
});

// Disabled MGA tests as they remove banks from DB which other functionality now depends on
// so other test will break if this is run before
describe.skip('/v1/banks', () => {
  let anAdmin;
  let aNonAdmin;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    anAdmin = testUsers().withRole(ADMIN).one();
    aNonAdmin = testUsers().withoutRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.BANKS]);
  });

  describe('GET /v1/banks', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/banks');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(aNonAdmin).get('/v1/banks');

      expect(status).toEqual(200);
    });

    it('returns a list of banks', async () => {
      const banks = [aBank({ id: '1' }), aBank({ id: '2' }), aBank({ id: '3' })];

      await as(anAdmin).postEach(banks).to('/v1/banks');

      const { status, body } = await as(aNonAdmin).get('/v1/banks');

      expect(status).toEqual(200);
      expect(body.banks).toEqual(expectMongoIds(banks));
    });
  });

  describe('GET /v1/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/banks/123');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(aNonAdmin).get('/v1/banks/123');

      expect(status).toEqual(200);
    });

    it('returns a bank', async () => {
      await as(anAdmin).post(newBank).to('/v1/banks');

      const { status, body } = await as(aNonAdmin).get('/v1/banks/112233');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newBank));
    });
  });

  describe('POST /v1/banks', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newBank).to('/v1/banks');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "admin" role', async () => {
      const { status } = await as(aNonAdmin).post(newBank).to('/v1/banks');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "admin" role', async () => {
      const { status } = await as(anAdmin).post(newBank).to('/v1/banks');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedBank).to('/v1/banks/112233');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "admin" role', async () => {
      await as(anAdmin).post(newBank).to('/v1/banks');
      const { status } = await as(aNonAdmin).put(updatedBank).to('/v1/banks/112233');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "admin" role', async () => {
      await as(anAdmin).post(newBank).to('/v1/banks');
      const { status } = await as(anAdmin).put(updatedBank).to('/v1/banks/112233');

      expect(status).toEqual(200);
    });

    it('updates the bank', async () => {
      await as(anAdmin).post(newBank).to('/v1/banks');
      await as(anAdmin).put(updatedBank).to('/v1/banks/112233');

      const { status, body } = await as(anAdmin).get('/v1/banks/112233');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedBank));
    });
  });

  describe('DELETE /v1/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/banks/112233');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "admin" role', async () => {
      await as(anAdmin).post(newBank).to('/v1/banks');
      const { status } = await as(aNonAdmin).remove('/v1/banks/112233');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "admin" role', async () => {
      await as(anAdmin).post(newBank).to('/v1/banks');
      const { status } = await as(anAdmin).remove('/v1/banks/112233');

      expect(status).toEqual(200);
    });

    it('deletes the bank', async () => {
      await as(anAdmin).post(newBank).to('/v1/banks');
      await as(anAdmin).remove('/v1/banks/112233');

      const { status, body } = await as(anAdmin).get('/v1/banks/112233');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });

  describe('Bank.Controller', () => {
    it('findOneBank returns a bank when no callback given', async () => {
      await as(anAdmin).post(newBank).to('/v1/banks');

      const bank = await bankController.findOneBank(newBank.id);

      expect(bank).toMatchObject(newBank);
    });
  });
});
