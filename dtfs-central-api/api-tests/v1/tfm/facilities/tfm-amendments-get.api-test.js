const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');

describe('/v1/tfm/facilities/:id/amendments', () => {
  let dealId;

  const mockUser = {
    _id: '123456789',
    username: 'temp',
    roles: [],
    bank: {
      id: '956',
      name: 'Barclays Bank',
    },
  };

  const newFacility = {
    type: 'Bond',
    dealId: MOCK_DEAL.DEAL_ID,
  };

  const newDeal = aDeal({
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    editedBy: [],
    eligibility: {
      status: 'Not started',
      criteria: [{}],
    },
  });

  const createDeal = async () => {
    const { body } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
    return body;
  };

  beforeAll(async () => {
    await wipeDB.wipe(['tfm-facilities', 'tfm-deals']);
  });

  beforeEach(async () => {
    const deal = await createDeal();
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('GET /v1/tfm/facilities/:id/amendment', () => {
    it('should return the full amendments object for a given facilityId', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      // creates 1 new amendment
      await api.post().to(`/v1/tfm/facilities/${newId}/amendment`);
      const { status, body } = await api.get(`/v1/tfm/facilities/${newId}/amendment`);

      expect(status).toEqual(200);

      const exp = [
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          status: expect.any(String)
        }
      ];

      expect(body).toEqual(exp);
    });

    it('should return 404 status if the facility does NOT exist', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, text } = await api.get('/v1/tfm/facilities/626a9270184ded001357c010/amendment/626a9270184ded001357c010');

      expect(status).toEqual(404);
      expect(text).toEqual('{"status":404,"message":"The current facility doesn\'t have the specified amendment"}');
    });

    it('should return 400 status if the  amendmentId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, text } = await api.get('/v1/tfm/facilities/626a9270184ded001357c010/amendment/123');

      expect(status).toEqual(400);
      expect(text).toEqual('{"status":400,"message":"Invalid facility or amendment Id"}');
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, text } = await api.get('/v1/tfm/facilities/123/amendment/626a9270184ded001357c010');

      expect(status).toEqual(400);
      expect(text).toEqual('{"status":400,"message":"Invalid facility or amendment Id"}');
    });

    it('should return 400 status if the facilityId and amendmentId have the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, text } = await api.get('/v1/tfm/facilities/123/amendment/1234');

      expect(status).toEqual(400);
      expect(text).toEqual('{"status":400,"message":"Invalid facility or amendment Id"}');
    });
  });
});
