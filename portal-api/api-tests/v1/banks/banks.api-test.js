const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const wipeDB = require('../../wipeDB');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');
const bankController = require('../../../src/v1/controllers/banks.controller');

const aBank = require('./bank-builder');

const newBank = aBank({ id: '112233' });
const updatedBank = aBank({
  id: '112233',
  bankName: 'Updated bank name',
});
const tfmBank = aBank({ id: '112234', useTFM: true });

describe('/v1/banks', () => {
  let anEditor;
  let aNonEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    anEditor = testUsers().withRole('editor').one();
    aNonEditor = testUsers().withoutRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['banks']);
  });

  describe('GET /v1/banks', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/banks');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(aNonEditor).get('/v1/banks');

      expect(status).toEqual(200);
    });

    it('returns a list of banks', async () => {
      const banks = [aBank({ id: '1' }), aBank({ id: '2' }), aBank({ id: '3' })];

      await as(anEditor).postEach(banks).to('/v1/banks');

      const { status, body } = await as(aNonEditor).get('/v1/banks');

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
      const { status } = await as(aNonEditor).get('/v1/banks/123');

      expect(status).toEqual(200);
    });

    it('returns a bank', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');

      const { status, body } = await as(aNonEditor).get('/v1/banks/112233');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newBank));
    });
  });

  describe('POST /v1/banks', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newBank).to('/v1/banks');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(aNonEditor).post(newBank).to('/v1/banks');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newBank).to('/v1/banks');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedBank).to('/v1/banks/112233');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');
      const { status } = await as(aNonEditor).put(updatedBank).to('/v1/banks/112233');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');
      const { status } = await as(anEditor).put(updatedBank).to('/v1/banks/112233');

      expect(status).toEqual(200);
    });

    it('updates the bank', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');
      await as(anEditor).put(updatedBank).to('/v1/banks/112233');

      const { status, body } = await as(anEditor).get('/v1/banks/112233');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedBank));
    });
  });

  describe('DELETE /v1/banks/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/banks/112233');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');
      const { status } = await as(aNonEditor).remove('/v1/banks/112233');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');
      const { status } = await as(anEditor).remove('/v1/banks/112233');

      expect(status).toEqual(200);
    });

    it('deletes the bank', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');
      await as(anEditor).remove('/v1/banks/112233');

      const { status, body } = await as(anEditor).get('/v1/banks/112233');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });

  describe('Bank.Controller', () => {
    it('findOneBank returns a bank when no callback given', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');

      const bank = await bankController.findOneBank(newBank.id);

      expect(bank).toMatchObject(newBank);
    });

    it('returns is a bank should use TFM instead of workflow', async () => {
      await as(anEditor).post(newBank).to('/v1/banks');

      const useTfmfalse = await bankController.isTFMBank(newBank.id);
      expect(useTfmfalse).toEqual(false);

      await as(anEditor).post(tfmBank).to('/v1/banks');

      const useTfmTrue = await bankController.isTFMBank(tfmBank.id);
      expect(useTfmTrue).toEqual(true);
    });
  });
});
