const wipeDB = require('../wipeDB');
const aBank = require('./bank-builder');

const app = require('../../src/createApp');
const { get, post, put, remove } = require('../api')(app);

describe('a bank', () => {
  const newBank = aBank({ id: '112233' });
  const updatedBank = aBank({
    id: '112233',
    bankName: 'Updated bank name',
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added bank is returned when we list all banks', async () => {
    await post(newBank).to('/api/banks');

    const {status, body} = await get('/api/banks');

    expect(status).toEqual(200);
    expect(body.banks[0]).toMatchObject(newBank);
  });

  it('a bank can be updated', async () => {
    await post(newBank).to('/api/banks');
    await put(updatedBank).to('/api/banks/112233');

    const {status, body} = await get('/api/banks/112233');

    expect(status).toEqual(200);
    expect(body).toMatchObject(updatedBank);
  });

  it('a bank can be deleted', async () => {
    await post(newBank).to('/api/banks');
    await remove('/api/banks/112233');

    const {status, body} = await get('/api/banks/112233');

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });
});
