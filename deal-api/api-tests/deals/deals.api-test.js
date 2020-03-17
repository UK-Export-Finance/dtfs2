const wipeDB = require('../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../src/createApp');

const { get, post, put, remove } = require('../api')(app);

describe('a deal', () => {
  const newDeal = aDeal({ id: '1996', supplyContractName: 'Original Value' });
  const updatedDeal = aDeal({
    id: '1996',
    supplyContractName: 'Updated Value',
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added deal is returned when we list all deals', async () => {
    await post(newDeal).to('/api/deals');

    const dealList = await get('/api/deals');
    expect(dealList.deals[0]).toMatchObject(newDeal);
  });

  it('a newly added deal can be looked up by id', async () => {
    await post(newDeal).to('/api/deals');

    const deal = await get('/api/deals/1996');
    expect(deal).toMatchObject(newDeal);
  });

  it('a deal can be updated', async () => {
    await post(newDeal).to('/api/deals');
    await put(updatedDeal).to('/api/deals/1996');

    const deal = await get('/api/deals/1996');
    expect(deal).toMatchObject(updatedDeal);
  });

  it('a deal can be deleted', async () => {
    await post(newDeal).to('/api/deals');
    await remove('/api/deals/1996');

    const deal = await get('/api/deals/1996');
    expect(deal).toMatchObject({});
  });
});
