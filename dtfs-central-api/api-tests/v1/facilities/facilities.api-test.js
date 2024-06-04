const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');
const { MOCK_DEAL } = require('../mocks/mock-data');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');

const mockFacility = {
  type: 'Bond',
  dealId: MOCK_DEAL.DEAL_ID,
};

const newDeal = aDeal({
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  editedBy: [],
  dealType: 'GEF',
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

const createDeal = async () => {
  const { body } = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
  return body;
};
describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    mockFacility.dealId = dealId;
  });

  describe('GET /v1/portal/facilities/', () => {
    it('returns multiple facilities', async () => {
      await api.post({ facility: mockFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
      await api.post({ facility: mockFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
      await api.post({ facility: mockFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');

      const { status, body } = await api.get('/v1/portal/facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(3);
    });

    it('returns 200 with empty array when there are no facilities', async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
      const { status, body } = await api.get('/v1/portal/facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(0);
    });
  });

  describe('POST /v1/portal/multiple-facilities', () => {
    it('creates and returns multiple facilities with createdDate and updatedAt', async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);

      const facilities = [mockFacility, mockFacility, mockFacility, mockFacility];

      const postBody = {
        facilities,
        user: MOCK_PORTAL_USER,
        dealId,
      };

      const { status, body } = await api.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(4);

      const facilityId = body[0];
      const { body: facilityAfterCreation } = await api.get(`/v1/portal/facilities/${facilityId}`);

      expect(typeof facilityAfterCreation.createdDate).toEqual('number');
      expect(typeof facilityAfterCreation.updatedAt).toEqual('number');
    });

    it('returns 400 where user is missing', async () => {
      const facilities = [mockFacility, mockFacility, mockFacility, mockFacility];

      const postBody = {
        facilities,
        dealId,
      };

      const { status } = await api.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(404);
    });

    it('returns 400 where deal is not found', async () => {
      const facilities = [mockFacility, mockFacility, mockFacility, mockFacility];

      const postBody = {
        facilities,
        dealId: '61e54dd5b578247e14575880',
      };

      const { status } = await api.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(404);
    });
  });
});
