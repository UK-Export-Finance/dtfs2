const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');

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

describe('PUT /v1/tfm/facilities/:id/amendments', () => {
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

  describe('PUT /v1/tfm/facilities/:id/amendments (creation)', () => {
    it('puts in an amendment with a put request for creation of facility', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      // amendment to insert
      const amendment1 = {
        _id: newId,
        amendments: {
          status: 'In progress',
          creationTimestamp: 111234,
          createdBy: mockUser,
        },
      };

      const { status, body } = await api.put({ amendmentsUpdate: amendment1 }).to(`/v1/tfm/facilities/${newId}/amendments`);

      expect(status).toEqual(200);

      const expected = {
        updated: { amendments: { history: [body.createdAmendment.amendments] } },
        createdAmendment: {
          _id: newId,
          amendments: {
            ...amendment1.amendments,
            _id: body.createdAmendment.amendments._id,
          },
        },
      };

      expect(body).toEqual(expected);
    });

    it('returns 401 if invalid dealId', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      // amendment to insert
      const amendment1 = {
        _id: newId,
        amendments: {
          status: 'In progress',
          creationTimestamp: 111234,
          createdBy: mockUser,
        },
      };

      const { status, text } = await api.put({ amendmentsUpdate: amendment1 }).to('/v1/tfm/facilities/11111a1a1a111a11aaaaa111/amendments');

      expect(status).toEqual(404);
      expect(text).toEqual('{"status":404,"message":"Facility not found"}');
    });

    it('returns 400 if dealId is wrong format', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      // amendment to insert
      const amendment1 = {
        _id: newId,
        amendments: {
          status: 'In progress',
          creationTimestamp: 111234,
          createdBy: mockUser,
        },
      };

      const { status, text } = await api.put({ amendmentsUpdate: amendment1 }).to('/v1/tfm/facilities/123/amendments');

      expect(status).toEqual(400);
      expect(text).toEqual('{"status":400,"message":"Unable to create amendments object"}');
    });
  });
});
