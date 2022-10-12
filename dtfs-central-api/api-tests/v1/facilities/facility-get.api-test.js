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

  describe('GET /v1/portal/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      const { status, body } = await api.get(`/v1/portal/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);
      expect(body.createdDate).toBeNumber();
    });
  });
});
