const wipeDB = require('../../wipeDB');
const aTransaction = require('./transaction-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { get, post, put, remove } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

describe('/v1/transactions', () => {
  let noRoles;
  let anEditor;

  const newTransaction = aTransaction({ bankFacilityId: '1a2b3c' });
  const updatedTransaction = aTransaction({
    bankFacilityId: '1a2b3c',
    stage: 'Updated transaction stage',
  });


  beforeEach(async () => {
    await wipeDB.wipe(['transactions']);

    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  describe('GET /v1/transactions', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/transactions');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await get('/v1/transactions', noRoles.token);

      expect(status).toEqual(200);
    });

    it('returns a list of transactions', async () => {
      const transactions = [
        aTransaction({ bankFacilityId: '1a2b3c', stage: 'AAA' }),
        aTransaction({ bankFacilityId: '2a3b4c', stage: 'BBB' }),
        aTransaction({ bankFacilityId: '3a4b5c', stage: 'CCC' }),
      ];

      await post(transactions[0], anEditor.token).to('/v1/transactions');
      await post(transactions[1], anEditor.token).to('/v1/transactions');
      await post(transactions[2], anEditor.token).to('/v1/transactions');

      const { status, body } = await get('/v1/transactions', noRoles.token);

      expect(status).toEqual(200);
      expect(body.transactions).toEqual(expectMongoIds(transactions));
    });
  });

  describe('GET /v1/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await get(
        '/v1/transactions/1a2b3c',
        noRoles.token,
      );

      expect(status).toEqual(200);
    });

    it('returns a transaction', async () => {
      await post(newTransaction, anEditor.token).to('/v1/transactions');

      const { status, body } = await get(
        '/v1/transactions/1a2b3c',
        noRoles.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newTransaction));
    });
  });

  describe('POST /v1/transactions', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await post(newTransaction).to('/v1/transactions');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await post(newTransaction, noRoles.token).to(
        '/v1/transactions',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await post(newTransaction, anEditor.token).to(
        '/v1/transactions',
      );

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await put(updatedTransaction).to(
        '/v1/transactions/1a2b3c',
      );

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newTransaction, anEditor.token).to('/v1/transactions');
      const { status } = await put(updatedTransaction, noRoles.token).to(
        '/v1/transactions/1a2b3c',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newTransaction, anEditor.token).to('/v1/transactions');
      const { status } = await put(updatedTransaction, anEditor.token).to(
        '/v1/transactions/1a2b3c',
      );

      expect(status).toEqual(200);
    });

    it('updates the transaction', async () => {
      await post(newTransaction, anEditor.token).to('/v1/transactions');
      await put(updatedTransaction, anEditor.token).to(
        '/v1/transactions/1a2b3c',
      );

      const { status, body } = await get(
        '/v1/transactions/1a2b3c',
        anEditor.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedTransaction));
    });
  });

  describe('DELETE /v1/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await remove('/v1/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newTransaction, anEditor.token).to('/v1/transactions');
      const { status } = await remove(
        '/v1/transactions/1a2b3c',
        noRoles.token,
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newTransaction, anEditor.token).to('/v1/transactions');
      const { status } = await remove(
        '/v1/transactions/1a2b3c',
        anEditor.token,
      );

      expect(status).toEqual(200);
    });

    it('deletes the transaction', async () => {
      await post(newTransaction, anEditor.token).to('/v1/transactions');
      await remove('/v1/transactions/1a2b3c', anEditor.token);

      const { status, body } = await get(
        '/v1/transactions/1a2b3c',
        anEditor.token,
      );

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
