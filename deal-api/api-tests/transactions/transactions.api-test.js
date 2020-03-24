const wipeDB = require('../wipeDB');
const aTransaction = require('./transaction-builder');

const app = require('../../src/createApp');
const { get, post, put, remove } = require('../api')(app);
const { expectMongoId, expectMongoIds} = require('../expectMongoIds');

const getToken = require('../getToken')(app);

describe('/api/transactions', () => {
  const newTransaction = aTransaction({ bankFacilityId: '1a2b3c' });
  const updatedTransaction = aTransaction({
    bankFacilityId: '1a2b3c',
    stage: 'Updated transaction stage',
  });

  let aTokenWithNoRoles;
  let aTokenWithEditorRole;

  beforeEach(async () => {
    await wipeDB();

    aTokenWithNoRoles    = await getToken({username:'1',password:'2',roles:[]});
    aTokenWithEditorRole = await getToken({username:'3',password:'4',roles:['editor']});
  });

  describe('GET /api/transactions', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/transactions');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const {status} = await get('/api/transactions', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a list of transactions', async () => {
      const transactions = [
        aTransaction({bankFacilityId: '1a2b3c', stage: 'AAA'}),
        aTransaction({bankFacilityId: '2a3b4c', stage: 'BBB'}),
        aTransaction({bankFacilityId: '3a4b5c', stage: 'CCC'})];

      await post(transactions[0], aTokenWithEditorRole).to('/api/transactions');
      await post(transactions[1], aTokenWithEditorRole).to('/api/transactions');
      await post(transactions[2], aTokenWithEditorRole).to('/api/transactions');

      const {status, body} = await get('/api/transactions', aTokenWithNoRoles);

      expect(status).toEqual(200);
      expect(body.transactions).toEqual(expectMongoIds(transactions));
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await get('/api/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const {status} = await get('/api/transactions/1a2b3c', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a transaction', async () => {
      await post(newTransaction, aTokenWithEditorRole).to('/api/transactions');

      const {status, body} = await get('/api/transactions/1a2b3c', aTokenWithNoRoles);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newTransaction));
    });

  });

  describe('POST /api/transactions', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await post(newTransaction).to('/api/transactions');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const {status} = await post(newTransaction, aTokenWithNoRoles).to('/api/transactions');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const {status} = await post(newTransaction, aTokenWithEditorRole).to('/api/transactions');

      expect(status).toEqual(200);
    });

  });

  describe('PUT /api/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await put(updatedTransaction).to('/api/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newTransaction, aTokenWithEditorRole).to('/api/transactions');
      const {status} = await put(updatedTransaction, aTokenWithNoRoles).to('/api/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newTransaction, aTokenWithEditorRole).to('/api/transactions');
      const {status} = await put(updatedTransaction, aTokenWithEditorRole).to('/api/transactions/1a2b3c');

      expect(status).toEqual(200);
    });

    it('updates the transaction', async () => {
      await post(newTransaction, aTokenWithEditorRole).to('/api/transactions');
      await put(updatedTransaction, aTokenWithEditorRole).to('/api/transactions/1a2b3c');

      const {status, body} = await get('/api/transactions/1a2b3c', aTokenWithEditorRole);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedTransaction));
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const {status} = await remove('/api/transactions/1a2b3c');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newTransaction, aTokenWithEditorRole).to('/api/transactions');
      const {status} = await remove('/api/transactions/1a2b3c', aTokenWithNoRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newTransaction, aTokenWithEditorRole).to('/api/transactions');
      const {status} = await remove('/api/transactions/1a2b3c', aTokenWithEditorRole);

      expect(status).toEqual(200);
    });

    it('deletes the transaction', async () => {
      await post(newTransaction, aTokenWithEditorRole).to('/api/transactions');
      await remove('/api/transactions/1a2b3c', aTokenWithEditorRole);

      const {status, body} = await get('/api/transactions/1a2b3c', aTokenWithEditorRole);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
