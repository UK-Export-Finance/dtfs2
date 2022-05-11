const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');

describe('/v1/tfm/facilities/:id/amendment', () => {
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
    it('should return all amendments based on facilityId', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      await api.post().to(`/v1/tfm/facilities/${newId}/amendment`);
      const { status, body } = await api.get(`/v1/tfm/facilities/${newId}/amendment`);

      expect(status).toEqual(200);

      const exp = [
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          status: expect.any(String),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1
        }
      ];

      expect(body).toEqual(exp);
    });

    it('should return 400 if the facilityId is not valid', async () => {
      const { status, body } = await api.get('/v1/tfm/facilities/1234/amendment');
      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });

    it('should return 200 with an empty array if the facility does not have any amendments', async () => {
      const { status, body } = await api.get('/v1/tfm/facilities/626a9270184ded001357c010/amendment');
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendment/:amendmentId', () => {
    it('should return 200 status if the facility has amendments', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: { amendmentId } } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendment`);
      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendment/${amendmentId}`);

      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        createdAt: expect.any(Number),
        status: expect.any(String),
        updatedAt: expect.any(Number),
        dealId: expect.any(String),
        facilityId: expect.any(String),
        version: 1,
      });
    });

    it('should return 400 status if the  amendmentId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/626a9270184ded001357c010/amendment/123');

      expect(status).toEqual(400);
      expect(body).toEqual({ message: 'Invalid facility or amendment Id', status: 400 });
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendment/626a9270184ded001357c010');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility or amendment Id' });
    });

    it('should return 400 status if the facilityId and amendmentId have the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendment/1234');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility or amendment Id' });
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendment/status/in-progress', () => {
    it('should return 200 status if the facility has an amendment that\'s in progress', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      await api.post().to(`/v1/tfm/facilities/${facilityId}/amendment`);
      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendment/status/in-progress`);

      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        createdAt: expect.any(Number),
        status: expect.any(String),
        updatedAt: expect.any(Number),
        dealId: expect.any(String),
        facilityId: expect.any(String),
        version: 1,
      });
    });

    it('should return 200 status if the facility does NOT have an amendment that\'s in progress', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendment/status/in-progress`);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendment/status/in-progress');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendment/status/completed', () => {
    it('should return 200 status if the facility has an amendment that\'s COMPLETED', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: { amendmentId } } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendment`);
      await api.put({ status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED }).to(`/v1/tfm/facilities/${facilityId}/amendment/${amendmentId}`);

      const { body: { amendmentId: amendmentId2 } } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendment`);
      await api.put({ status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED }).to(`/v1/tfm/facilities/${facilityId}/amendment/${amendmentId2}`);

      await api.post().to(`/v1/tfm/facilities/${facilityId}/amendment`);

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendment/status/completed`);

      expect(status).toEqual(200);
      expect(body).toEqual([
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1,
        }, {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 2,
        }
      ]);
    });

    it('should return 200 status if the facility does NOT have an amendment that\'s COMPLETED', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendment/status/completed`);

      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendment/status/completed');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendment/status/completed/latest', () => {
    it('should return 200 status if the facility has an amendment that\'s COMPLETED', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: { amendmentId } } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendment`);
      await api.put({ status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED }).to(`/v1/tfm/facilities/${facilityId}/amendment/${amendmentId}`);

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendment/status/completed/latest`);

      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        createdAt: expect.any(Number),
        status: expect.any(String),
        updatedAt: expect.any(Number),
        dealId: expect.any(String),
        facilityId: expect.any(String),
        version: 1,
      });
    });

    it('should return 200 status if the facility does NOT have an amendment that\'s COMPLETED', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendment/status/completed/latest`);

      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendment/status/completed/latest');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });
  });
});
