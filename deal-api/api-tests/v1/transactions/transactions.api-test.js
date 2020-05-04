const wipeDB = require('../../wipeDB');
const aTransaction = require('./transaction-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const newTransaction = aTransaction({ bankFacilityId: '1a2b3c' });
const updatedTransaction = aTransaction({
  bankFacilityId: '1a2b3c',
  stage: 'Updated transaction stage',
});

describe('/v1/transactions', () => {
  let noRoles;
  let anEditor;

  beforeAll(async() => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['transactions']);
  });

  describe('GET /v1/transactions', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/transactions');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/transactions');

      expect(status).toEqual(200);
    });

    it('returns a list of transactions', async () => {
      const transactions = [
        aTransaction({ bankFacilityId: '1a2b3c', stage: 'AAA' }),
        aTransaction({ bankFacilityId: '2a3b4c', stage: 'BBB' }),
        aTransaction({ bankFacilityId: '3a4b5c', stage: 'CCC' }),
      ];

      await as(anEditor).postEach(transactions).to('/v1/transactions');

      const { status, body } = await as(noRoles).get('/v1/transactions');

      expect(status).toEqual(200);
      expect(body.transactions).toEqual(expectMongoIds(transactions));
    });
  });

  describe('GET /v1/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/transactions/1a2b3c');

      expect(status).toEqual(200);
    });

    it('returns a transaction', async () => {
      await as(anEditor).post(newTransaction).to('/v1/transactions');

      const { status, body } = await as(noRoles).get('/v1/transactions/1a2b3c');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newTransaction));
    });
  });

  describe('POST /v1/transactions', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newTransaction).to('/v1/transactions');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(noRoles).post(newTransaction).to(
        '/v1/transactions',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newTransaction).to('/v1/transactions');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedTransaction).to('/v1/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newTransaction).to('/v1/transactions');

      const { status } = await as(noRoles).put(updatedTransaction).to('/v1/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newTransaction).to('/v1/transactions');
      const { status } = await as(anEditor).put(updatedTransaction).to('/v1/transactions/1a2b3c');

      expect(status).toEqual(200);
    });

    it('updates the transaction', async () => {
      await as(anEditor).post(newTransaction).to('/v1/transactions');
      await as(anEditor).put(updatedTransaction).to('/v1/transactions/1a2b3c');

      const { status, body } = await as(anEditor).get('/v1/transactions/1a2b3c');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedTransaction));
    });
  });

  describe('DELETE /v1/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newTransaction).to('/v1/transactions');

      const { status } = await as(noRoles).remove('/v1/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newTransaction).to('/v1/transactions');

      const { status } = await as(anEditor).remove('/v1/transactions/1a2b3c');

      expect(status).toEqual(200);
    });

    it('deletes the transaction', async () => {
      await as(anEditor).post(newTransaction).to('/v1/transactions');
      await as(anEditor).remove('/v1/transactions/1a2b3c');

      const { status, body } = await as(anEditor).get('/v1/transactions/1a2b3c');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
