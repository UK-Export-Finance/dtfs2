const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const wipeDB = require('../../../wipeDB');
const aDeal = require('../../deal-builder');

const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');

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
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('GET /v1/tfm/deal/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
      const dealId = postResult.body._id;

      await api
        .put({
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.dealSnapshot).toMatchObject(newDeal);
    });

    describe('when a deal has facilities', () => {
      it('returns facilities mapped to deal.bondTransactions and deal.loanTransactions', async () => {
        const postResult = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
        const dealId = postResult.body._id;

        // create some facilities
        const mockFacility = {
          dealId,
          value: 123456,
          user: MOCK_PORTAL_USER,
        };

        const mockBond = {
          type: 'Bond',
          ...mockFacility,
        };

        const mockLoan = {
          type: 'Loan',
          ...mockFacility,
        };

        const { body: createdBond1 } = await api.post({ facility: mockBond, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
        const { body: createdBond2 } = await api.post({ facility: mockBond, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
        const { body: createdLoan1 } = await api.post({ facility: mockLoan, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
        const { body: createdLoan2 } = await api.post({ facility: mockLoan, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');

        const { body: bond1 } = await api.get(`/v1/portal/facilities/${createdBond1._id}`);
        const { body: bond2 } = await api.get(`/v1/portal/facilities/${createdBond2._id}`);
        const { body: loan1 } = await api.get(`/v1/portal/facilities/${createdLoan1._id}`);
        const { body: loan2 } = await api.get(`/v1/portal/facilities/${createdLoan2._id}`);

        await api
          .put({
            dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to('/v1/tfm/deals/submit');

        const { status, body } = await api.get(`/v1/tfm/deals/${dealId}`);

        expect(status).toEqual(200);

        expect(body.deal.dealSnapshot.bondTransactions.items).toEqual([bond1, bond2]);

        expect(body.deal.dealSnapshot.loanTransactions.items).toEqual([loan1, loan2]);
      });
    });
  });

  describe('PUT /v1/tfm/deal/:id/snapshot', () => {
    it('400s if the deal id provided is invalid', async () => {
      const { status, body } = await api.put({}).to('/v1/tfm/deals/test/snapshot');
      expect(status).toEqual(400);
      expect(body.message).toEqual('Invalid Deal Id');
    });

    it('404s if deal id is valid but does not exist', async () => {
      const { status, body } = await api
        .put({ auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id) })
        .to('/v1/tfm/deals/61e54e2e532cf2027303e001/snapshot');
      expect(status).toEqual(404);
      expect(body.message).toEqual('Deal not found');
    });

    describe('with a valid deal', () => {
      let dealId;
      const mockTfm = {
        tfm: {
          submissionDetails: {
            exporterPartyUrn: '12345',
          },
        },
      };

      beforeEach(async () => {
        const { body: portalDeal } = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
        dealId = portalDeal._id;

        await api
          .put({
            dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to('/v1/tfm/deals/submit');

        // add some dummy data to deal.tfm
        await api
          .put({
            dealUpdate: mockTfm,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to(`/v1/tfm/deals/${dealId}`);
      });

      withValidateAuditDetailsTests({
        makeRequest: (auditDetails) =>
          api
            .put({
              auditDetails,
              snapshotUpdate: {
                someNewField: true,
                testing: true,
              },
            })
            .to(`/v1/tfm/deals/${dealId}/snapshot`),
        validUserTypes: ['portal'],
      });

      it('updates deal.dealSnapshot whilst retaining existing snapshot deal.tfm', async () => {
        const snapshotUpdate = {
          snapshotUpdate: {
            someNewField: true,
            testing: true,
          },
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        };

        const { status } = await api.put(snapshotUpdate).to(`/v1/tfm/deals/${dealId}/snapshot`);

        expect(status).toEqual(200);

        const { body: bodyAfterUpdate } = await api.get(`/v1/tfm/deals/${dealId}`);

        expect(bodyAfterUpdate.deal.dealSnapshot).toMatchObject({
          ...newDeal,
          ...snapshotUpdate.snapshotUpdate,
        });

        expect(bodyAfterUpdate.deal.tfm).toEqual({
          ...mockTfm.tfm,
          lastUpdated: expect.any(Number),
        });

        expect(bodyAfterUpdate.deal.auditRecord).toEqual({
          lastUpdatedAt: expect.any(String),
          lastUpdatedByPortalUserId: MOCK_PORTAL_USER._id,
          lastUpdatedByTfmUserId: null,
          lastUpdatedByIsSystem: null,
          noUserLoggedIn: null,
        });
      });
    });
  });
});
