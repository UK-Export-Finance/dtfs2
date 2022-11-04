const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { MOCK_BSS_FACILITY, MOCK_BSS_DEAL, MOCK_USER } = require('../mocks/mock-data');

const createDeal = async () => {
  const { body } = await api.post({ deal: MOCK_BSS_DEAL, user: MOCK_USER }).to('/v1/portal/deals');
  return body;
};

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals', 'facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    MOCK_BSS_FACILITY.dealId = dealId;
  });

  describe('GET /v1/portal/facilities/', () => {
    it('returns multiple facilites', async () => {
      await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');

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
    it('creates and returns multiple facilites with createdDate and updatedAt', async () => {
      await wipeDB.wipe(['facilities']);

      const facilities = [MOCK_BSS_FACILITY, MOCK_BSS_FACILITY, MOCK_BSS_FACILITY, MOCK_BSS_FACILITY];

      const postBody = {
        facilities,
        user: MOCK_USER,
        dealId,
      };

      const { status, body } = await api.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(4);

      const facilityId = body[0];
      const { body: facilityAfterCreation } = await api.get(`/v1/portal/facilities/${facilityId}`);

      expect(facilityAfterCreation.createdDate).toBeNumber();
      expect(facilityAfterCreation.updatedAt).toBeNumber();
    });

    it('returns 400 where deal is not found', async () => {
      const facilities = [MOCK_BSS_FACILITY, MOCK_BSS_FACILITY];

      const postBody = {
        facilities,
        dealId: '61e54dd5b578247e14575880',
      };

      const { status } = await api.post(postBody).to('/v1/portal/multiple-facilities');
      expect(status).toEqual(404);
    });
  });
});
