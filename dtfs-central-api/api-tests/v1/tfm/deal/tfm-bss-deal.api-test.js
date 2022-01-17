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
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
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

  describe('GET /v1/tfm/deal/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/tfm/deals/61e54e2e532cf2027303e001');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = postResult.body._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.dealSnapshot).toMatchObject(newDeal);
    });

    describe('when a deal has facilities', () => {
      it('returns facilities mapped to deal.bondTransactions and deal.loanTransactions', async () => {
        const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
        const dealId = postResult.body._id;

        // create some facilities
        const mockFacility = {
          dealId,
          value: 123456,
          user: mockUser,
        };

        const mockBond = {
          type: 'Bond',
          ...mockFacility,
        };

        const mockLoan = {
          type: 'Loan',
          ...mockFacility,
        };

        const { body: createdBond1 } = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
        const { body: createdBond2 } = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
        const { body: createdLoan1 } = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');
        const { body: createdLoan2 } = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');

        const { body: bond1 } = await api.get(`/v1/portal/facilities/${createdBond1._id}`);
        const { body: bond2 } = await api.get(`/v1/portal/facilities/${createdBond2._id}`);
        const { body: loan1 } = await api.get(`/v1/portal/facilities/${createdLoan1._id}`);
        const { body: loan2 } = await api.get(`/v1/portal/facilities/${createdLoan2._id}`);

        await api.put({
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
        }).to('/v1/tfm/deals/submit');

        const { status, body } = await api.get(`/v1/tfm/deals/${dealId}`);

        expect(status).toEqual(200);

        expect(body.deal.dealSnapshot.bondTransactions.items).toEqual([
          bond1,
          bond2,
        ]);

        expect(body.deal.dealSnapshot.loanTransactions.items).toEqual([
          loan1,
          loan2,
        ]);
      });
    });
  });

  describe('PUT /v1/tfm/deal/:id/snapshot', () => {
    it('404s if updating an unknown id', async () => {
      const { status } = await api.put({}).to('/v1/tfm/deals/61e54e2e532cf2027303e001/snapshot');
      expect(status).toEqual(404);
    });

    it('updates deal.dealSnapshot whilst retaining existing snapshot deal.tfm', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      const mockTfm = {
        tfm: {
          submissionDetails: {
            exporterPartyUrn: '12345',
          },
        },
      };
      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
      }).to('/v1/tfm/deals/submit');

      // add some dummy data to deal.tfm
      await api.put({
        dealUpdate: mockTfm,
      }).to(`/v1/tfm/deals/${dealId}`);

      const snapshotUpdate = {
        someNewField: true,
        testing: true,
      };

      const { status } = await api.put(snapshotUpdate).to(`/v1/tfm/deals/${dealId}/snapshot`);

      expect(status).toEqual(200);

      const { body: dealAfterUpdate } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(dealAfterUpdate.deal.dealSnapshot).toMatchObject({
        ...newDeal,
        ...snapshotUpdate,
      });

      expect(dealAfterUpdate.deal.tfm).toEqual({
        ...mockTfm.tfm,
        lastUpdated: expect.any(Number),
      });
    });
  });
});
