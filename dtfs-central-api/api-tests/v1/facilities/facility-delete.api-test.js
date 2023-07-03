const axios = require('axios');
const dotenv = require('dotenv');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');
const { MOCK_DEAL } = require('../mocks/mock-data');

dotenv.config();

const { DTFS_CENTRAL_API } = process.env;
const { API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const newBondFacility = {
  dealId: MOCK_DEAL.DEAL_ID,
  type: 'Bond',
};

let bondFacilityId;

const newDeal = aDeal({
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
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  beforeEach(async () => {
    const { data: deal } = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API}/v1/portal/deals`,
      data: { deal: newDeal, user: mockUser },
      headers,
    });

    dealId = deal._id;
    newBondFacility.dealId = dealId;

    const { data: facility } = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API}/v1/portal/facilities`,
      data: { facility: newBondFacility, user: mockUser },
      headers,
    });

    bondFacilityId = facility._id;
  });

  describe('DELETE /v1/portal/facilities/:id', () => {
    it('deletes the facility', async () => {
      const removeBody = {
        dealId: newBondFacility.dealId,
        user: mockUser,
      };

      const { status } = await axios({
        method: 'delete',
        url: `${DTFS_CENTRAL_API}/v1/portal/facilities/${bondFacilityId}`,
        data: removeBody,
        headers,
      });

      expect(status).toEqual(200);
    });
  });
});
