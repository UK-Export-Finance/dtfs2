const { MONGO_DB_COLLECTIONS, generatePortalAuditDetails } = require('@ukef/dtfs2-common');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const aDeal = require('../../deal-builder');
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');

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
  const { body } = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
  return body;
};

describe('/v1/tfm/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  beforeEach(async () => {
    const deal = await createDeal();
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('GET /v1/tfm/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api
        .put({
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);

      expect(typeof body.facilitySnapshot.createdDate).toEqual('number');
    });
  });
});
