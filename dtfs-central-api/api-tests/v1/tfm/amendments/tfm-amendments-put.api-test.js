const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');

describe('PUT /v1/tfm/facilities/:id/amendments', () => {
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
    await wipeDB.wipe(['tfm-facilities', 'tfm-deals', 'users']);
  });

  beforeEach(async () => {
    const deal = await createDeal();
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('PUT /v1/tfm/facilities/:id/amendment/:amendmentId', () => {
    it('should update an amendment based on facilityId and amendmentId', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.post().to(`/v1/tfm/facilities/${newId}/amendment/`);
      const updatePayload = { createdBy: mockUser };
      const { body: bodyPutResponse } = await api.put({ updatePayload }).to(`/v1/tfm/facilities/${newId}/amendment/${body.amendmentId}`);

      const expected = {
        dealId: expect.any(String),
        facilityId: expect.any(String),
        status: expect.any(String),
        amendmentId: expect.any(String),
        createdAt: expect.any(Number),
        updatePayload,
        updatedAt: expect.any(Number),
        version: 1
      };
      expect(status).toEqual(200);
      expect(bodyPutResponse).toEqual(expected);
    });

    it('should return 404 if facilityId and amendmentId are valid but are NOT associated to a record', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const updatePayload = { createdBy: mockUser };
      const { status } = await api.post().to(`/v1/tfm/facilities/${newId}/amendment/`);
      const { body: bodyPutResponse } = await api.put({ updatePayload }).to(`/v1/tfm/facilities/${newId}/amendment/626aa00e2446022434c52148`);

      expect(status).toEqual(200);
      expect(bodyPutResponse).toEqual({ status: 404, message: 'The amendment does not exist' });
    });

    it('should return 400 if invalid dealId', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');
      const { status, body } = await api.put({ amendmentsUpdate: {} }).to('/v1/tfm/facilities/123/amendment/1234');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility or amendment id' });
    });
  });
});
