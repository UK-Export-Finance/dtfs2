const { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const { testApi } = require('../../test-api');
const { expectAddedFields } = require('./expectAddedFields');
const { DEALS } = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');

const mockUserNoBank = {
  _id: '6603ebb1b81328945f63a1a2',
  username: 'temp',
  password: '',
  roles: [],
};

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

  describe('POST /v1/portal/deals', () => {
    withValidateAuditDetailsTests({
      makeRequest: async (auditDetails) => await testApi.post({ auditDetails, deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals'),
      validUserTypes: [AUDIT_USER_TYPES.PORTAL],
    });

    it('returns the created deal with correct fields', async () => {
      const { body, status, auditDetails } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
      const expectedResponse = expectAddedFields({ baseDeal: newDeal, auditDetails });

      expect(status).toEqual(200);

      const { body: createdDeal } = await testApi.get(`/v1/portal/deals/${body._id}`);

      expect(createdDeal.deal).toEqual(expectedResponse);

      expect(createdDeal.deal.maker).toEqual(MOCK_PORTAL_USER);
      expect(createdDeal.deal.bank).toEqual(MOCK_PORTAL_USER.bank);
      expect(createdDeal.deal.eligibility.status).toEqual(newDeal.eligibility.status);
      expect(createdDeal.deal.eligibility.criteria).toEqual(newDeal.eligibility.criteria);
      expect(createdDeal.deal.facilities).toEqual([]);
    });

    describe('when user is invalid', () => {
      it('missing user returns 400', async () => {
        const postBody = {
          bankInternalRefName: '',
          additionalRefName: '',
        };

        const { status } = await testApi.post({ deal: postBody }).to('/v1/portal/deals');

        expect(status).toEqual(400);
      });

      it('user with no bank returns validation errors', async () => {
        const postBody = {
          dealType: 'GEF',
          bankInternalRefName: '1234',
          additionalRefName: 'name',
        };

        const { body, status } = await createDeal({ deal: postBody, user: mockUserNoBank });

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.makerObject).toBeDefined();
        expect(body.validationErrors.errorList.makerObject.text).toEqual('deal.maker object with bank is required');
      });
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          dealType: 'GEF',
          bankInternalRefName: '',
          additionalRefName: '',
        };

        const { body, status } = await createDeal({ deal: postBody, user: MOCK_PORTAL_USER });

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(2);

        expect(body.validationErrors.errorList.bankInternalRefName).toBeDefined();
        expect(body.validationErrors.errorList.bankInternalRefName.text).toEqual('Enter the Bank deal ID');

        expect(body.validationErrors.errorList.additionalRefName).toBeDefined();
        expect(body.validationErrors.errorList.additionalRefName.text).toEqual('Enter the Bank deal name');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          dealType: 'GEF',
          bankInternalRefName: 'a'.repeat(31),
          additionalRefName: 'b'.repeat(101),
        };

        const { body, status } = await createDeal({ deal: postBody, user: mockUserNoBank });

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(3);

        expect(body.validationErrors.errorList.bankInternalRefName).toBeDefined();
        expect(body.validationErrors.errorList.bankInternalRefName.text).toEqual('Bank deal ID must be 30 characters or fewer');

        expect(body.validationErrors.errorList.additionalRefName).toBeDefined();
        expect(body.validationErrors.errorList.additionalRefName.text).toEqual('Bank deal name must be 100 characters or fewer');

        expect(body.validationErrors.errorList.makerObject).toBeDefined();
        expect(body.validationErrors.errorList.makerObject.text).toEqual('deal.maker object with bank is required');
      });
    });
  });
});
