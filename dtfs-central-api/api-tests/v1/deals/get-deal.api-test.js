const { MONGO_DB_COLLECTIONS, TFM_DEAL_STAGE, DEAL_STATUS } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const { testApi } = require('../../test-api');
const { expectAddedFields } = require('./expectAddedFields');
const { DEALS } = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');
const { createFacility } = require('../../helpers/create-facility');
const { createTfmUser } = require('../../helpers/create-tfm-user');

const originalProcessEnv = { ...process.env };

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
  status: DEALS.DEAL_STATUS.DRAFT,
  exporter: {
    companyName: 'mock company',
  },
  bankInternalRefName: 'test',
  submissionType: DEALS.SUBMISSION_TYPE.AIN,
  updatedAt: 123456789,
});

describe('/v1/portal/deals', () => {
  let dealId;
  let tfmUserId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS]);

    const tfmUser = await createTfmUser();
    tfmUserId = tfmUser._id;
  });

  beforeEach(async () => {
    const postResult = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
    dealId = postResult.body._id;
  });

  describe('GET /v1/portal/deals/:id', () => {
    it('returns the requested resource', async () => {
      const { status, body } = await testApi.get(`/v1/portal/deals/${dealId}`);

      const expectedResponse = expectAddedFields({ baseDeal: newDeal, auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id) });

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectedResponse);
    });

    describe('when a BSS deal has facilities', () => {
      it('returns facilities mapped to deal.bondTransactions and deal.loanTransactions', async () => {
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

        const { status, body } = await testApi.get(`/v1/portal/deals/${dealId}`);

        expect(status).toEqual(200);
        expect(body.deal.bondTransactions.items).toEqual([bond1, bond2]);

        expect(body.deal.loanTransactions.items).toEqual([loan1, loan2]);
      });
    });

    describe('when the deal is cancelled in tfm', () => {
      beforeEach(async () => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'true';

        await testApi
          .put({
            dealType: DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to('/v1/tfm/deals/submit');

        await testApi
          .put({
            dealUpdate: {
              tfm: {
                dateReceived: '23-09-2024',
                dateReceivedTimestamp: 1727085149,
                parties: {},
                activities: [],
                product: DEALS.DEAL_TYPE.BSS_EWCS,
                stage: TFM_DEAL_STAGE.CONFIRMED,
                exporterCreditRating: 'Acceptable (B+)',
                lastUpdated: 1727085149571,
                lossGivenDefault: 50,
                probabilityOfDefault: 12,
              },
            },
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to(`/v1/tfm/deals/${dealId}`);

        const tfmDealCancellation = { reason: '', effectiveFrom: new Date().valueOf(), bankRequestDate: new Date().valueOf() };

        await testApi
          .put({
            dealCancellationUpdate: tfmDealCancellation,
            auditDetails: generateTfmAuditDetails(tfmUserId),
          })
          .to(`/v1/tfm/deals/${dealId}/cancellation`);

        await testApi
          .post({ cancellation: tfmDealCancellation, auditDetails: generateTfmAuditDetails(tfmUserId) })
          .to(`/v1/tfm/deals/${dealId}/cancellation/submit`);
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      it('returns deal with status cancelled', async () => {
        // Act
        const { status, body } = await testApi.get(`/v1/portal/deals/${dealId}`);

        // Assert
        expect(status).toEqual(200);
        expect(body.deal).toEqual(
          expect.objectContaining({
            status: DEAL_STATUS.CANCELLED,
          }),
        );
      });
    });
  });
});
