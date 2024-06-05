const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { expectAddedFieldsWithEditedBy } = require('./expectAddedFields');
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
  let postResult;
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    postResult = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
  });
  describe('PUT /v1/portal/deals/:id', () => {
    it('returns the updated deal', async () => {
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: 'change this field',
        eligibility: {
          ...newDeal.eligibility,
          mockNewField: true,
        },
      };

      const expectedAuditRecord = generateParsedMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id);
      const expectedResponse = { ...updatedDeal, auditRecord: expectedAuditRecord };

      const { status, body } = await api.put({ dealUpdate: updatedDeal, user: MOCK_PORTAL_USER }).to(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body).toEqual(expectAddedFieldsWithEditedBy({ baseDeal: expectedResponse, user: MOCK_PORTAL_USER, auditDetails: postResult.auditDetails }));
    });

    it('handles partial updates', async () => {
      const createdDeal = postResult.body;

      const partialUpdate = {
        additionalRefName: 'change this field',
        eligibility: {
          mockNewField: true,
        },
      };

      const expectedDataIncludingUpdate = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: 'change this field',
        eligibility: {
          ...newDeal.eligibility,
          mockNewField: true,
        },
      };

      const { status: putStatus } = await api.put({ dealUpdate: partialUpdate, user: MOCK_PORTAL_USER }).to(`/v1/portal/deals/${createdDeal._id}`);
      expect(putStatus).toEqual(200);

      const { status, body } = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(
        expectAddedFieldsWithEditedBy({ baseDeal: expectedDataIncludingUpdate, user: MOCK_PORTAL_USER, auditDetails: postResult.auditDetails }),
      );
    });

    it('updates the deal', async () => {
      const createdDeal = postResult.body;

      const updatedDeal = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: 'change this field',
      };

      await api.put({ dealUpdate: updatedDeal, user: MOCK_PORTAL_USER }).to(`/v1/portal/deals/${createdDeal._id}`);

      const { status, body } = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body.deal).toEqual(expectAddedFieldsWithEditedBy({ baseDeal: updatedDeal, user: MOCK_PORTAL_USER, auditDetails: postResult.auditDetails }));
    });

    it('adds updates and retains `editedBy` array with user data', async () => {
      const createdDeal = postResult.body;
      const firstUpdate = {
        ...createdDeal,
        additionalRefName: 'change this field',
      };

      const expectedAuditRecord = generateParsedMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id);

      await api.put({ dealUpdate: firstUpdate, user: MOCK_PORTAL_USER }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterFirstUpdate = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      const secondUpdate = {
        ...dealAfterFirstUpdate.body.deal,
        additionalRefName: 'change this field again',
      };
      const expectedResponse = { ...secondUpdate, auditRecord: expectedAuditRecord };

      await api.put({ dealUpdate: secondUpdate, user: MOCK_PORTAL_USER }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterSecondUpdate = await api.get(`/v1/portal/deals/${createdDeal._id}`);
      expect(dealAfterSecondUpdate.status).toEqual(200);

      expect(dealAfterSecondUpdate.body.deal.editedBy.length).toEqual(2);
      expect(dealAfterSecondUpdate.body.deal.editedBy[0]).toEqual(
        expectAddedFieldsWithEditedBy({ baseDeal: expectedResponse, user: MOCK_PORTAL_USER, auditDetails: postResult.auditDetails, numberOfUpdates: 1 })
          .editedBy[0],
      );
      expect(dealAfterSecondUpdate.body.deal.editedBy[1]).toEqual(
        expectAddedFieldsWithEditedBy({ baseDeal: expectedResponse, user: MOCK_PORTAL_USER, auditDetails: postResult.auditDetails, numberOfUpdates: 2 })
          .editedBy[1],
      );
    });
  });
});
