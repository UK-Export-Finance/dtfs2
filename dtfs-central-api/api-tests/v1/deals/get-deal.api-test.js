const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const { testApi } = require('../../test-api');
const { expectAddedFields } = require('./expectAddedFields');
const { DEALS } = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');
const { createFacility } = require('../../helpers/create-facility');

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
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  describe('GET /v1/portal/deals/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
      const expectedResponse = expectAddedFields({ baseDeal: newDeal, auditDetails: postResult.auditDetails });

      const dealId = postResult.body._id;

      const { status, body } = await testApi.get(`/v1/portal/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectedResponse);
    });

    describe('when a BSS deal has facilities', () => {
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

        const { status, body } = await testApi.get(`/v1/portal/deals/${dealId}`);

        expect(status).toEqual(200);
        expect(body.deal.bondTransactions.items).toEqual([bond1, bond2]);

        expect(body.deal.loanTransactions.items).toEqual([loan1, loan2]);
      });
    });
  });
});
