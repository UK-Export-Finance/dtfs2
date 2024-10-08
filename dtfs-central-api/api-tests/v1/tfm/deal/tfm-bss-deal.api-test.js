const { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES } = require('@ukef/dtfs2-common');
const { generateTfmAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const wipeDB = require('../../../wipeDB');
const aDeal = require('../../deal-builder');

const { testApi } = require('../../../test-api');
const { DEALS } = require('../../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const { createDeal } = require('../../../helpers/create-deal');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');
const { createFacility } = require('../../../helpers/create-facility');

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

describe('/v1/tfm/deals/:id', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('GET /v1/tfm/deals/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
      const dealId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await testApi.get(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.dealSnapshot).toMatchObject(newDeal);
    });

    describe('when a deal has facilities', () => {
      it('returns facilities mapped to deal.bondTransactions and deal.loanTransactions', async () => {
        const postResult = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
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

        const { body: createdBond1 } = await createFacility({ facility: mockBond, user: MOCK_PORTAL_USER });
        const { body: createdBond2 } = await createFacility({ facility: mockBond, user: MOCK_PORTAL_USER });
        const { body: createdLoan1 } = await createFacility({ facility: mockLoan, user: MOCK_PORTAL_USER });
        const { body: createdLoan2 } = await createFacility({ facility: mockLoan, user: MOCK_PORTAL_USER });

        const { body: bond1 } = await testApi.get(`/v1/portal/facilities/${createdBond1._id}`);
        const { body: bond2 } = await testApi.get(`/v1/portal/facilities/${createdBond2._id}`);
        const { body: loan1 } = await testApi.get(`/v1/portal/facilities/${createdLoan1._id}`);
        const { body: loan2 } = await testApi.get(`/v1/portal/facilities/${createdLoan2._id}`);

        await testApi
          .put({
            dealType: DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to('/v1/tfm/deals/submit');

        const { status, body } = await testApi.get(`/v1/tfm/deals/${dealId}`);

        expect(status).toEqual(200);

        expect(body.deal.dealSnapshot.bondTransactions.items).toEqual([bond1, bond2]);

        expect(body.deal.dealSnapshot.loanTransactions.items).toEqual([loan1, loan2]);
      });
    });
  });

  describe('PUT /v1/tfm/deal/:id/snapshot', () => {
    it('400s if the deal id provided is invalid', async () => {
      const { status, body } = await testApi.put({}).to('/v1/tfm/deals/test/snapshot');
      expect(status).toEqual(400);
      expect(body.message).toEqual('Invalid Deal Id');
    });

    it('404s if deal id is valid but does not exist', async () => {
      const { status, body } = await testApi
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
        const { body: portalDeal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
        dealId = portalDeal._id;

        await testApi
          .put({
            dealType: DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to('/v1/tfm/deals/submit');

        // add some dummy data to deal.tfm
        await testApi
          .put({
            dealUpdate: mockTfm,
            auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
          })
          .to(`/v1/tfm/deals/${dealId}`);
      });

      withValidateAuditDetailsTests({
        makeRequest: (auditDetails) =>
          testApi
            .put({
              auditDetails,
              snapshotUpdate: {
                someNewField: true,
                testing: true,
              },
            })
            .to(`/v1/tfm/deals/${dealId}/snapshot`),
        validUserTypes: [AUDIT_USER_TYPES.PORTAL],
      });

      it('updates deal.dealSnapshot whilst retaining existing snapshot deal.tfm', async () => {
        const auditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
        const snapshotUpdate = {
          snapshotUpdate: {
            someNewField: true,
            testing: true,
          },
          auditDetails,
        };

        const { status } = await testApi.put(snapshotUpdate).to(`/v1/tfm/deals/${dealId}/snapshot`);

        expect(status).toEqual(200);

        const { body: bodyAfterUpdate } = await testApi.get(`/v1/tfm/deals/${dealId}`);

        expect(bodyAfterUpdate.deal.dealSnapshot).toMatchObject({
          ...newDeal,
          ...snapshotUpdate.snapshotUpdate,
        });

        expect(bodyAfterUpdate.deal.tfm).toEqual({
          ...mockTfm.tfm,
          lastUpdated: expect.any(Number),
        });

        expect(bodyAfterUpdate.deal.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(auditDetails));
      });
    });
  });
});
