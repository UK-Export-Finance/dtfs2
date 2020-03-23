const wipeDB = require('../wipeDB');
const aTransaction = require('./transaction-builder');

const app = require('../../src/createApp');

const { get, post, put, remove } = require('../api')(app);

describe('a transaction', () => {
  const newTransaction = aTransaction({ bankFacilityId: '1a2b3c' });
  const updatedTransaction = aTransaction({
    bankFacilityId: '1a2b3c',
    stage: 'Updated transaction stage',
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added transaction is returned when we list all transactions', async () => {
    await post(newTransaction).to('/api/transactions');

    const {status, body} = await get('/api/transactions');

    expect(status).toEqual(200);
    expect(body.transactions[0]).toMatchObject(newTransaction);
  });

  it('a transaction can be updated', async () => {
    await post(newTransaction).to('/api/transactions');
    await put(updatedTransaction).to('/api/transactions/1a2b3c');

    const {status, body} = await get('/api/transactions/1a2b3c');

    expect(status).toEqual(200);
    expect(body).toMatchObject(updatedTransaction);
  });

  it('a transaction can be deleted', async () => {
    await post(newTransaction).to('/api/transactions');
    await remove('/api/transactions/1a2b3c');

    const {status, body} = await get('/api/transactions/1a2b3c');

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });
});
