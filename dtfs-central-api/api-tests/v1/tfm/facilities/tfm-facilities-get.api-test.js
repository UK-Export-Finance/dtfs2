const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

const newFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
  dealId: MOCK_DEAL.DEAL_ID,
};

describe('/v1/tfm/deals/:id/facilities', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('GET /v1/tfm/deal/:id/facilities', () => {
    it('returns the requested resource', async () => {
      // create deal
      const { body: createdDeal } = await api.post(newDeal).to('/v1/portal/gef/deals');

      const dealId = createdDeal._id;

      // create some facilities
      newFacility.dealId = dealId;
      await api.post(newFacility).to('/v1/portal/gef/facilities');
      await api.post(newFacility).to('/v1/portal/gef/facilities');

      // submit deal/facilities
      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/deals/${dealId}/facilities`);

      expect(status).toEqual(200);

      // get facilities after they've been created so we have all the data
      const { body: allFacilitiesAfterCreation } = await api.get(`/v1/portal/gef/deals/${dealId}/facilities`);

      const expectedFacilityShape = (facility) => ({
        _id: facility._id,
        facilitySnapshot: {
          _id: facility._id,
          ...newFacility,
        },
        amendments: {
          history: [],
        },
      });

      // assert all facilities returned from GET against the created facilities
      const facility1 = body.find((f) => f._id === allFacilitiesAfterCreation[0]._id);
      const facility2 = body.find((f) => f._id === allFacilitiesAfterCreation[1]._id);

      expect(facility1).toEqual(expectedFacilityShape(facility1));
      expect(facility2).toEqual(expectedFacilityShape(facility2));
    });
  });
});
