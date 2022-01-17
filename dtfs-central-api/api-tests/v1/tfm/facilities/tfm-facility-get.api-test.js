const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const aDeal = require('../../deal-builder');
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');

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

describe('/v1/tfm/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('GET /v1/tfm/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);

      expect(typeof body.facilitySnapshot.createdDate).toEqual('number');
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/tfm/facilities/61e54e2e532cf2027303e001');

      expect(status).toEqual(404);
    });
  });
});
