const wipeDB = require('../../../wipeDB');
const aDeal = require('../../deal-builder');

const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const newDeal = aDeal({
  bankSupplyContractName: 'mock name',
  bankSupplyContractID: 'mock id',
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

describe('/v1/tfm/deal/:id', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('PUT /v1/tfm/deal/:id', () => {
    const dealUpdate = {
      tfm: {
        someNewField: true,
        parties: {
          exporter: {
            partUrn: '12345',
          },
        },
      },
    };

    it('404s if updating an unknown id', async () => {
      const { status } = await api.put({ dealUpdate }).to('/v1/tfm/deals/12345678');
      expect(status).toEqual(404);
    });

    it('updates the created deal with correct fields, retaining original dealSnapshot', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const { status } = await api.put({ dealUpdate }).to(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);

      const { body } = await api.get(`/v1/tfm/deals/${dealId}`);

      const dealAfterUpdate = body.deal;

      expect(dealAfterUpdate.dealSnapshot).toMatchObject(newDeal);
      expect(dealAfterUpdate.tfm).toEqual({
        ...dealUpdate.tfm,
        lastUpdated: expect.any(Number),
      });
    });

    it('does NOT add anything to the root if for example deal.dealSnapshot or deal.tfm is not passed', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const badDealUpdate = {
        noDealSnapshot: true,
        noTfmObject: true,
      };

      const { status } = await api.put({ dealUpdate }).to(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);

      const { body } = await api.get(`/v1/tfm/deals/${dealId}`);

      const dealAfterUpdate = body.deal;

      expect(dealAfterUpdate.noDealSnapshot).toBeUndefined();
      expect(dealAfterUpdate.noTfmObject).toBeUndefined();
    });

    it('retains existing deal.tfm.history when adding new history', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const firstHistoryUpdate = {
        tfm: {
          history: {
            tasks: [
              { firstTaskHistory: true },
            ],
            emails: [
              { firstEmailHistory: true },
            ],
          },
        },
      };

      const { status: firstUpdateStatus } = await api.put({ dealUpdate: firstHistoryUpdate }).to(`/v1/tfm/deals/${dealId}`);

      expect(firstUpdateStatus).toEqual(200);

      const { body: dealFirstUpdateBody } = await api.get(`/v1/tfm/deals/${dealId}`);

      const dealAfterFirstUpdate = dealFirstUpdateBody.deal;

      expect(dealAfterFirstUpdate.tfm.history).toEqual(firstHistoryUpdate.tfm.history);

      const secondHistoryUpdate = {
        tfm: {
          history: {
            tasks: [
              { secondTaskHistory: true },
            ],
            emails: [
              { secondEmailHistory: true },
            ],
          },
        },
      };

      const { status: secondUpdateStatus } = await api.put({ dealUpdate: secondHistoryUpdate }).to(`/v1/tfm/deals/${dealId}`);

      expect(secondUpdateStatus).toEqual(200);

      const { body: dealSecondUpdateBody } = await api.get(`/v1/tfm/deals/${dealId}`);

      const dealAfterSecondUpdate = dealSecondUpdateBody.deal;

      const expectedHistory = {
        tasks: [
          ...firstHistoryUpdate.tfm.history.tasks,
          ...secondHistoryUpdate.tfm.history.tasks,
        ],
        emails: [
          ...firstHistoryUpdate.tfm.history.emails,
          ...secondHistoryUpdate.tfm.history.emails,
        ],
      };

      expect(dealAfterSecondUpdate.tfm.history).toEqual(expectedHistory);
    });

    it('updates deal.tfm.lastUpdated on each update', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const anUpdate = {
        tfm: { test: true },
      };

      // first update
      await api.put({ dealUpdate: anUpdate }).to(`/v1/tfm/deals/${dealId}`);

      const { body: firstUpdateBody } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(typeof firstUpdateBody.deal.tfm.lastUpdated).toEqual('number');

      const lastUpdatedOriginalValue = firstUpdateBody.deal.tfm.lastUpdated;

      // second update
      await api.put({ dealUpdate: anUpdate }).to(`/v1/tfm/deals/${dealId}`);

      const { body: secondUpdateBody } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(typeof secondUpdateBody.deal.tfm.lastUpdated).toEqual('number');
      expect(secondUpdateBody.deal.tfm.lastUpdated).not.toEqual(lastUpdatedOriginalValue);
    });

    it('should not add blank activity object to deal.tfm.activities', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const tfmObject = {
        tfm: {
          activities: [],
        },
      };

      await api.put({ dealUpdate: tfmObject }).to(`/v1/tfm/deals/${dealId}`);

      const blankCommentObj = {};

      const blankActivity = {
        tfm: {
          activities: blankCommentObj,
        },
      };

      await api.put({ dealUpdate: blankActivity }).to(`/v1/tfm/deals/${dealId}`);

      const { body: dealAfterUpdate } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(dealAfterUpdate.deal.tfm.activities).toEqual([]);
    });

    it('should add correct activity object to tfm in reverse order', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const tfmObject = {
        tfm: {
          activities: [],
        },
      };

      await api.put({ dealUpdate: tfmObject }).to(`/v1/tfm/deals/${dealId}`);

      const MOCK_AUTHOR = {
        firstName: 'tester',
        lastName: 'smith',
        _id: 12243343242342,
      };

      const commentObj = {
        type: 'COMMENT',
        timestamp: 13345665,
        text: 'test1',
        author: MOCK_AUTHOR,
        label: 'Comment added',
      };

      const singleCommentActivity = {
        tfm: {
          activities: commentObj,
        },
      };

      await api.put({ dealUpdate: singleCommentActivity }).to(`/v1/tfm/deals/${dealId}`);

      const { body: firstCommentUpdate } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(firstCommentUpdate.deal.tfm.activities).toEqual([commentObj]);

      const secondCommentObj = {
        type: 'COMMENT',
        timestamp: 13345665,
        text: 'test2',
        author: MOCK_AUTHOR,
        label: 'Comment added',
      };

      const secondCommentActivity = {
        tfm: {
          activities: secondCommentObj,
        },
      };

      await api.put({ dealUpdate: secondCommentActivity }).to(`/v1/tfm/deals/${dealId}`);

      const { body: secondCommentUpdate } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(secondCommentUpdate.deal.tfm.activities).toEqual([secondCommentObj, commentObj]);
    });
  });
});
