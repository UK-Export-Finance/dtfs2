const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');
const { MOCK_DEAL } = require('../mocks/mock-data');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

const newFacility = {
  dealId: MOCK_DEAL.DEAL_ID,
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
};

const createDeal = async () => {
  const { body } = await api.post(newDeal).to('/v1/portal/gef/deals');
  return body;
};
describe('/v1/portal/gef/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('POST /v1/portal/gef/facilities', () => {
    it('returns 404 when the associated deal is not found', async () => {
      const facilityWithInvalidDealId = {
        ...newFacility,
        dealId: MOCK_DEAL.DEAL_ID,
      };

      const { status } = await api.post(facilityWithInvalidDealId).to('/v1/portal/gef/facilities');

      expect(status).toEqual(404);
    });

    it('returns new facility id and creates the facility', async () => {
      const { body, status } = await api.post(newFacility).to('/v1/portal/gef/facilities');

      expect(status).toEqual(200);

      const facilityId = body._id;

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: allFacilitiesByDealId } = await api.get(`/v1/portal/gef/deals/${dealId}/facilities`);

      expect(allFacilitiesByDealId).toEqual([{
        _id: facilityId,
        ...newFacility,
      }]);
    });
  });
});
