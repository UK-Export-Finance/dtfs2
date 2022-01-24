const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
  exporter: { companyName: 'Mock Company name' },
  hasBeenIssued: true,
};

const newFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
  dealId: 123,
  ukefFacilityId: '223344',
  value: '2000',
  coverEndDate: '2021-08-12T00:00:00.000Z',
  currency: { id: 'GBP' },
};
describe('/v1/tfm/facilities', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });
  describe('GET /v1/tfm/facilities', () => {
    it('returns the requested resource', async () => {
      // create deal
      const { body: createdDeal } = await api.post(newDeal).to('/v1/portal/gef/deals');

      const dealId = createdDeal._id;

      // create some facilities
      newFacility.dealId = dealId;
      await api.post(newFacility).to('/v1/portal/gef/facilities');

      // submit deal/facilities
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF, dealId }).to('/v1/tfm/deals/submit');

      // get facilities after they've been created so we have all the data
      const { body: allFacilitiesAfterCreation } = await api.get('/v1/tfm/facilities');

      const expectedFacilityShape = {
        tfmFacilities: {
          dealId: expect.any(String),
          ukefFacilityId: expect.any(String),
          facilityId: expect.any(String),
          type: expect.any(String),
          dealType: expect.any(String),
          value: expect.any(String),
          companyName: expect.any(String),
          currency: expect.any(String),
          coverEndDate: expect.any(String),
        },
      };

      expect(allFacilitiesAfterCreation[0]).toEqual(expectedFacilityShape);
    });
  });
});
