const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');
const { MOCK_DEAL } = require('../mocks/mock-data');
const { DB_COLLECTIONS } = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');

const newFacility = {
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
    await wipeDB.wipe([DB_COLLECTIONS.DEALS, DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('GET /v1/portal/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      const { status, body } = await api.get(`/v1/portal/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);
      expect(typeof body.createdDate).toEqual('number');
    });
  });
});
