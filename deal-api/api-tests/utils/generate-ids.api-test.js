const db = require('../../src/drivers/db-client');

const {
  generateDealId,
  generateFacilityId,
} = require('../../src/utils/generate-ids');

describe('utils - genetateIds', () => {
  beforeAll(async () => {
    const collection = await db.getCollection('idCounters');
    await collection.remove({});
  });

  it('should initialise deal counter if it doesn\'t exist', async () => {
    const dealId = await generateDealId();
    expect(dealId).toEqual('1000000');

    const dealId2 = await generateDealId();
    expect(dealId2).toEqual('1000001');
  });

  it('should initialise facility counter if it doesn\'t exist', async () => {
    const dealId = await generateFacilityId();
    expect(dealId).toEqual('1000000');

    const dealId2 = await generateFacilityId();
    expect(dealId2).toEqual('1000001');
  });
});
