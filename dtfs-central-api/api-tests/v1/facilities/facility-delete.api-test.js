const axios = require('axios');
const dotenv = require('dotenv');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');
const { MOCK_DEAL } = require('../mocks/mock-data');
const { DB_COLLECTIONS } = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');

dotenv.config();

const { DTFS_CENTRAL_API_URL, DTFS_CENTRAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': DTFS_CENTRAL_API_KEY,
};

const newBondFacility = {
  dealId: MOCK_DEAL.DEAL_ID,
  type: 'Bond',
};

let bondFacilityId;

const newDeal = aDeal({
  dealType: 'GEF',
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.DEALS, DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const { data: deal } = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals`,
      data: { deal: newDeal, user: MOCK_PORTAL_USER },
      headers,
    });

    dealId = deal._id;
    newBondFacility.dealId = dealId;

    const { data: facility } = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities`,
      data: { facility: newBondFacility, user: MOCK_PORTAL_USER },
      headers,
    });

    bondFacilityId = facility._id;
  });

  describe('DELETE /v1/portal/facilities/:id', () => {
    it('deletes the facility', async () => {
      const removeBody = {
        dealId: newBondFacility.dealId,
        user: MOCK_PORTAL_USER,
      };

      const { status } = await axios({
        method: 'delete',
        url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${bondFacilityId}`,
        data: removeBody,
        headers,
      });

      expect(status).toEqual(200);
    });
  });
});
