const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { expectAddedFields } = require('./expectAddedFields');
const CONSTANTS = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');

const newDeal = aDeal({
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  exporter: {
    companyName: 'mock company',
  },
  bankInternalRefName: 'test',
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  updatedAt: 123456789,
});

describe('/v1/portal/deals', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  describe('GET /v1/portal/deals/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
      const dealId = postResult.body._id;

      const { status, body } = await api.get(`/v1/portal/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFields(newDeal));
    });

    describe('when a BSS deal has facilities', () => {
      it('returns facilities mapped to deal.bondTransactions and deal.loanTransactions', async () => {
        const postResult = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
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

        const { status, body } = await api.get(`/v1/portal/deals/${dealId}`);

        expect(status).toEqual(200);
        expect(body.deal.bondTransactions.items).toEqual([bond1, bond2]);

        expect(body.deal.loanTransactions.items).toEqual([loan1, loan2]);
      });
    });
  });
});
