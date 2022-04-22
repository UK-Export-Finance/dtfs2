const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');

describe('/v1/tfm/facilities/:id/amendments', () => {
  let dealId;

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

  beforeAll(async () => {
    await wipeDB.wipe(['tfm-facilities', 'tfm-deals']);
  });

  beforeEach(async () => {
    const deal = await createDeal();
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('GET /v1/tfm/facilities/:id/amendments', () => {
    it('it should return the full amendments collection from tfm-facilities', async () => {
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
          creationDate: 111234,
        },
      };

      // creates 2 new amendments
      const insertedAmendment1 = await api.put({ amendmentsUpdate: amendment1 }).to(`/v1/tfm/facilities/${newId}/amendments`);
      const insertedAmendment2 = await api.put({ amendmentsUpdate: amendment1 }).to(`/v1/tfm/facilities/${newId}/amendments`);

      const { status, body } = await api.get(`/v1/tfm/facilities/${newId}/amendments`);

      expect(status).toEqual(200);

      // insertedAmendment1.body.createdAmendment.amendments gives the inserted amendment
      const expected = {
        history: [insertedAmendment1.body.createdAmendment.amendments, insertedAmendment2.body.createdAmendment.amendments],
      };

      expect(body).toEqual(expected);
    });

    it('it should return 404 status if facility not found', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const { status, text } = await api.get('/v1/tfm/facilities/11111a1a1a111a11aaaaa111/amendments');

      expect(status).toEqual(404);
      expect(text).toEqual('{"status":404,"message":"Facility not found"}');
    });

    it('it should return 400 status if id is wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const { status, text } = await api.get('/v1/tfm/facilities/123/amendments');

      expect(status).toEqual(400);
      expect(text).toEqual('{"status":400,"message":"Invalid facility Id"}');
    });
  });
});
