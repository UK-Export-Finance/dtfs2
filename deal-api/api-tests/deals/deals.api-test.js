const wipeDB = require('../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../src/createApp');
const {get, post, put} = require('../api')(app);

describe('a deal', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added deal is returned when we list all deals', async () => {
    const newDeal = aDeal({id: "1994"})

    await post(newDeal).to('/api/deals');

    const listOfDeals = await get('/api/deals');

    expect(listOfDeals).toMatch('\"id\":\"1994\"')
  });

  it('a newly added deal can be looked up by id', async () => {
    const newDeal = aDeal({id: "1995"})

    await post(newDeal).to('/api/deals');

    const foundDeal = await get('/api/deals/1995');

    expect(foundDeal).toMatch('\"id\":\"1995\"')
  });

  it('a deal can be updated', async () => {
    const newDeal = aDeal({id: "1996", supplyContractName: 'Original Value'});
    const updatedDeal = aDeal({id: "1996", supplyContractName: 'Updated Value'});

    await post(newDeal).to('/api/deals');
    await put(updatedDeal).to('/api/deals/1996');

    const ourDeal = await get('/api/deals/1996');

    expect(ourDeal).toMatch('\"supplyContractName\":\"Updated Value\"')
  });
});
