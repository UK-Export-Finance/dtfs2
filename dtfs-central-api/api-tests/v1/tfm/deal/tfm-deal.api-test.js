const wipeDB = require('../../../wipeDB');
const aDeal = require('../../deal-builder');

const app = require('../../../../src/createApp');
const api = require('../../../api')(app);

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
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
  },
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

describe('/v1/tfm/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('GET /v1/tfm/deals', () => {
    it('returns all deals', async () => {
      const miaDeal = {
        ...newDeal,
        details: {
          ...newDeal.details,
          submissionType: 'Manual Inclusion Application',
        },
      };

      const minDeal = {
        ...newDeal,
        details: {
          ...newDeal.details,
          submissionType: 'Manual Inclusion Notice',
        },
      };

      const ainDeal = {
        ...newDeal,
        details: {
          ...newDeal.details,
          submissionType: 'Automatic Inclusion Notice',
        },
      };

      // create deals
      const minDealResponse = await api.post({ deal: minDeal, user: mockUser }).to('/v1/portal/deals');
      const miaDealResponse = await api.post({ deal: miaDeal, user: mockUser }).to('/v1/portal/deals');
      const ainDeal1Response = await api.post({ deal: ainDeal, user: mockUser }).to('/v1/portal/deals');
      const ainDeal2Response = await api.post({ deal: ainDeal, user: mockUser }).to('/v1/portal/deals');

      expect(minDealResponse.status).toEqual(200);
      expect(miaDealResponse.status).toEqual(200);
      expect(ainDeal1Response.status).toEqual(200);
      expect(ainDeal2Response.status).toEqual(200);

      // submit deals
      const minDealResponseSubmitResponse = await api.put({}).to(`/v1/tfm/deals/${minDealResponse.body._id}/submit`);
      const miaDealResponseSubmitResponse = await api.put({}).to(`/v1/tfm/deals/${miaDealResponse.body._id}/submit`);
      const ainDeal1ResponseSubmitResponse = await api.put({}).to(`/v1/tfm/deals/${ainDeal1Response.body._id}/submit`);
      const ainDeal2ResponseSubmitResponse = await api.put({}).to(`/v1/tfm/deals/${ainDeal2Response.body._id}/submit`);

      const { status, body } = await api.get('/v1/tfm/deals');

      expect(status).toEqual(200);
      const totalDeals = 4;
      expect(body.deals.length).toEqual(totalDeals);
    });
  });

  describe('GET /v1/tfm/deal/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/tfm/deals/12345678910');
      expect(status).toEqual(404);
    });

    it('404s if submitting an unknown id', async () => {
      const { status } = await api.put({}).to('/v1/tfm/deals/12345678/submit');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = postResult.body._id;

      const submitDeal = await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

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
          associatedDealId: dealId,
          facilityValue: 123456,
          user: mockUser,
        };

        const mockBond = {
          facilityType: 'bond',
          ...mockFacility,
        };

        const mockLoan = {
          facilityType: 'loan',
          ...mockFacility,
        };

        const createdBond1 = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
        const createdBond2 = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
        const createdLoan1 = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');
        const createdLoan2 = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');

        await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

        const { status, body } = await api.get(`/v1/tfm/deals/${dealId}`);

        expect(status).toEqual(200);

        expect(body.deal.dealSnapshot.bondTransactions.items).toEqual([
          createdBond1.body,
          createdBond2.body,
        ]);

        expect(body.deal.dealSnapshot.loanTransactions.items).toEqual([
          createdLoan1.body,
          createdLoan2.body,
        ]);
      });
    });
  });

  describe('PUT /v1/tfm/deals', () => {
    const dealUpdate = {
      tfm: {
        submissionDetails: {
          exporterPartyUrn: '12345',
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

      await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

      const { status, body } = await api.put({ dealUpdate }).to(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.dealSnapshot).toMatchObject(newDeal);
      expect(body.tfm).toEqual(dealUpdate.tfm);
    });

    it('retains existing deal.tfm.history when adding new history', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

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

      const firstUpdateResponse = await api.put({ dealUpdate: firstHistoryUpdate }).to(`/v1/tfm/deals/${dealId}`);

      expect(firstUpdateResponse.status).toEqual(200);
      expect(firstUpdateResponse.body.tfm.history).toEqual(firstHistoryUpdate.tfm.history);

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

      const secondUpdateResponse = await api.put({ dealUpdate: secondHistoryUpdate }).to(`/v1/tfm/deals/${dealId}`);

      expect(secondUpdateResponse.status).toEqual(200);

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

      expect(secondUpdateResponse.body.tfm.history).toEqual(expectedHistory);
    });
  });

  describe('PUT /v1/tfm/deal/:id/snapshot', () => {
    it('404s if updating an unknown id', async () => {
      const { status } = await api.put({}).to('/v1/tfm/deals/12345678/snapshot');
      expect(status).toEqual(404);
    });

    it('updates deal.dealSnapshot whilst retaining deal.tfm', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      const mockTfm = {
        tfm: {
          submissionDetails: {
            exporterPartyUrn: '12345',
          },
        },
      };
      await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

      // add some dummy data to deal.tfm
      await api.put({
        dealUpdate: mockTfm,
      }).to(`/v1/tfm/deals/${dealId}`);

      const snapshotUpdate = {
        someNewField: true,
        testing: true,
      };

      const { status, body } = await api.put(snapshotUpdate).to(`/v1/tfm/deals/${dealId}/snapshot`);

      expect(status).toEqual(200);
      expect(body.dealSnapshot).toMatchObject({
        ...newDeal,
        ...snapshotUpdate,
      });
      expect(body.tfm).toEqual(mockTfm.tfm);
    });
  });

  describe('PUT /v1/tfm/deal/:id/stage', () => {
    const dealStageUpdate = {
      stage: 'New stage',
    };

    it('404s if updating an unknown id', async () => {
      const { status } = await api.put(dealStageUpdate).to('/v1/tfm/deals/12345678/stage');
      expect(status).toEqual(404);
    });

    it('updates deal.tfm.stage', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      const dealUpdate = {
        tfm: {
          submissionDetails: {
            exporterPartyUrn: '12345',
          },
        },
      };

      await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

      // add some dummy data to deal.tfm
      await api.put({ dealUpdate }).to(`/v1/tfm/deals/${dealId}`);

      const { status, body } = await api.put(dealStageUpdate).to(`/v1/tfm/deals/${dealId}/stage`);

      expect(status).toEqual(200);
      expect(body.dealSnapshot).toMatchObject(newDeal);
      expect(body.tfm).toEqual({
        ...dealUpdate.tfm,
        stage: dealStageUpdate.stage,
      });
    });
  });
});
