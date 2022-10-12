const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_BSS_FACILITY, MOCK_BSS_DEAL, MOCK_USER } = require('../../mocks/mock-data');

describe('POST TFM amendments', () => {
  let dealId;

  const createDeal = async () => {
    const { body } = await api.post({ deal: MOCK_BSS_DEAL, user: MOCK_USER }).to('/v1/portal/deals');
    return body;
  };

  beforeAll(async () => {
    await wipeDB.wipe(['tfm-facilities', 'tfm-deals']);
  });

  beforeEach(async () => {
    const deal = await createDeal();
    dealId = deal._id;

    MOCK_BSS_FACILITY.dealId = dealId;
  });

  describe('POST /v1/tfm/facilities/:id/amendment', () => {
    it('should create a new amendment based on facilityId', async () => {
      const postResult = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body } = await api.post().to(`/v1/tfm/facilities/${newId}/amendment`);
      expect(body).toEqual({ amendmentId: expect.any(String) });
    });

    it('should return 400 if an amendment already exists', async () => {
      const postResult = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse1 } = await api.post().to(`/v1/tfm/facilities/${newId}/amendment`);
      const updatePayload1 = { status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS };
      await api.put(updatePayload1).to(`/v1/tfm/facilities/${newId}/amendment/${bodyPostResponse1.amendmentId}`);
      const { body } = await api.post().to(`/v1/tfm/facilities/${newId}/amendment`);
      expect(body).toEqual({ status: 400, message: 'The current facility already has an amendment in progress' });
    });

    it('should return 404 if the facility does not exist', async () => {
      const postResult = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      await api.post().to(`/v1/tfm/facilities/${newId}/amendment`);
      const { body } = await api.post().to('/v1/tfm/facilities/62727d055ca1841f08216353/amendment');
      expect(body).toEqual({ status: 404, message: 'The current facility does not exist' });
    });

    it('should return 400 if the facility Id is not valid', async () => {
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body } = await api.post().to('/v1/tfm/facilities/123/amendment');
      expect(body).toEqual({ status: 400, message: 'Invalid facility id' });
    });
  });
});
