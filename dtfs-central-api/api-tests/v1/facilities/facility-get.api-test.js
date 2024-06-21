const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { testApi } = require('../../test-api');
const aDeal = require('../deal-builder');
const { MOCK_DEAL } = require('../mocks/mock-data');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');
const { createFacility } = require('../../helpers/create-facility');

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

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('GET /v1/portal/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const newId = postResult.body._id;

      const { status, body } = await testApi.get(`/v1/portal/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);
      expect(typeof body.createdDate).toEqual('number');
    });
  });
});
