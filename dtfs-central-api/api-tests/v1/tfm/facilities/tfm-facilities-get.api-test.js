const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('..api/../../api')(app);
const CONSTANTS = require('../../../../src/constants');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

const newFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
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
      newFacility.applicationId = dealId;
      const { body: facility1 } = await api.post(newFacility).to('/v1/portal/gef/facilities');
      const { body: facility2 } = await api.post(newFacility).to('/v1/portal/gef/facilities');

      // submit deal/facilities
      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/deals/${dealId}/facilities`);

      const expectedFacilityShape = (facility) => ({
        _id: facility._id,
        facilitySnapshot: {
          ...facility,
        },
      });

      expect(status).toEqual(200);
      expect(body).toEqual([
        expectedFacilityShape(facility1),
        expectedFacilityShape(facility2),
      ]);
    });
  });
});
