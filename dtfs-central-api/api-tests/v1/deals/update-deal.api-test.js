import { ObjectId } from 'mongodb';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import * as wipeDB from '../../wipeDB';
import aDeal from '../deal-builder';
import { testApi } from '../../test-api';
import { expectAddedFieldsWithEditedBy } from './expectAddedFields';
import { DEALS } from '../../../src/constants';
import { MOCK_PORTAL_USER } from '../../mocks/test-users/mock-portal-user';
import { createDeal } from '../../helpers/create-deal';
import { withValidateAuditDetailsTests } from '../../helpers/with-validate-audit-details.api-tests';

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
  describe('PUT /v1/portal/deals/:id', () => {
    const updateAuditDetails = generatePortalAuditDetails(new ObjectId());
    let createdDeal;

    beforeEach(async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
      ({ body: createdDeal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER }));
    });

    afterAll(async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
    });

    withValidateAuditDetailsTests({
      makeRequest: async (auditDetails) =>
        await testApi
          .put({
            dealUpdate: {
              additionalRefName: 'change this field',
            },
            user: MOCK_PORTAL_USER,
            auditDetails,
          })
          .to(`/v1/portal/deals/${createdDeal._id}`),
    });

    it('returns the updated deal', async () => {
      const updatedDeal = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: 'change this field',
        eligibility: {
          ...newDeal.eligibility,
          mockNewField: true,
        },
      };

      const { status, body } = await testApi
        .put({ dealUpdate: updatedDeal, user: MOCK_PORTAL_USER, auditDetails: updateAuditDetails })
        .to(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body).toEqual(expectAddedFieldsWithEditedBy({ baseDeal: updatedDeal, user: MOCK_PORTAL_USER, auditDetails: updateAuditDetails }));
    });

    it('handles partial updates', async () => {
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

      const { status: putStatus } = await testApi
        .put({ dealUpdate: partialUpdate, user: MOCK_PORTAL_USER, auditDetails: updateAuditDetails })
        .to(`/v1/portal/deals/${createdDeal._id}`);
      expect(putStatus).toEqual(200);

      const { status, body } = await testApi.get(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(
        expectAddedFieldsWithEditedBy({ baseDeal: expectedDataIncludingUpdate, user: MOCK_PORTAL_USER, auditDetails: updateAuditDetails }),
      );
    });

    it('updates the deal', async () => {
      const updatedDeal = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: 'change this field',
      };

      await testApi.put({ dealUpdate: updatedDeal, user: MOCK_PORTAL_USER, auditDetails: updateAuditDetails }).to(`/v1/portal/deals/${createdDeal._id}`);

      const { status, body } = await testApi.get(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body.deal).toEqual(expectAddedFieldsWithEditedBy({ baseDeal: updatedDeal, user: MOCK_PORTAL_USER, auditDetails: updateAuditDetails }));
    });

    it('adds updates and retains `editedBy` array with user data', async () => {
      const updateTwoAuditDetails = generatePortalAuditDetails(new ObjectId());
      const firstUpdate = {
        ...createdDeal,
        additionalRefName: 'change this field',
      };

      await testApi.put({ dealUpdate: firstUpdate, user: MOCK_PORTAL_USER, auditDetails: updateAuditDetails }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterFirstUpdate = await testApi.get(`/v1/portal/deals/${createdDeal._id}`);

      const secondUpdate = {
        ...dealAfterFirstUpdate.body.deal,
        additionalRefName: 'change this field again',
      };

      await testApi.put({ dealUpdate: secondUpdate, user: MOCK_PORTAL_USER, auditDetails: updateTwoAuditDetails }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterSecondUpdate = await testApi.get(`/v1/portal/deals/${createdDeal._id}`);
      expect(dealAfterSecondUpdate.status).toEqual(200);

      expect(dealAfterSecondUpdate.body.deal.editedBy.length).toEqual(2);
      expect(dealAfterSecondUpdate.body.deal.editedBy[0]).toEqual(
        expectAddedFieldsWithEditedBy({ baseDeal: secondUpdate, user: MOCK_PORTAL_USER, auditDetails: updateAuditDetails, numberOfUpdates: 1 }).editedBy[0],
      );
      expect(dealAfterSecondUpdate.body.deal.editedBy[1]).toEqual(
        expectAddedFieldsWithEditedBy({ baseDeal: secondUpdate, user: MOCK_PORTAL_USER, auditDetails: updateTwoAuditDetails, numberOfUpdates: 2 }).editedBy[1],
      );
    });
  });
});
