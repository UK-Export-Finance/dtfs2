const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const mockFacility = {
  type: 'Bond',
  dealId: '123123456',
};

const newDeal = aDeal({
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
describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    mockFacility.dealId = dealId;
  });

  describe('GET /v1/portal/facilities/', () => {
    it('returns multiple facilties', async () => {
      await api.post({ facility: mockFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.post({ facility: mockFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.post({ facility: mockFacility, user: mockUser }).to('/v1/portal/facilities');

      const { status, body } = await api.get('/v1/portal/facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(3);
    });

    it('returns 200 with empty array when there are no facilities', async () => {
      await wipeDB.wipe(['facilities']);
      const { status, body } = await api.get('/v1/portal/facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(0);
    });
  });

  describe('POST /v1/portal/multiple-facilities', () => {
    it('creates multiple facilties', async () => {
      await wipeDB.wipe(['facilities']);

      const facilities = [
        mockFacility,
        mockFacility,
        mockFacility,
        mockFacility,
      ];

      const postBody = {
        facilities,
        user: mockUser,
        dealId,
      };

      const { status, body } = await api.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(4);
    });

    it('returns 400 where user is missing', async () => {
      const facilities = [
        mockFacility,
        mockFacility,
        mockFacility,
        mockFacility,
      ];

      const postBody = {
        facilities,
        dealId,
      };

      const { status } = await api.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(404);
    });

    it('returns 400 where deal is not found', async () => {
      const facilities = [
        mockFacility,
        mockFacility,
        mockFacility,
        mockFacility,
      ];

      const postBody = {
        facilities,
        dealId: '1234',
      };

      const { status } = await api.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(404);
    });
  });
});
