import { AUDIT_USER_TYPES } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { withDeleteOneTests, generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { withValidateAuditDetailsTests } from '../../helpers/with-validate-audit-details.api-tests';
import { testApi } from '../../test-api';
import { DEALS } from '../../../src/constants';
import aDeal from '../deal-builder';
import { MOCK_PORTAL_USER } from '../../mocks/test-users/mock-portal-user';
import { createDeal } from '../../helpers/create-deal';
import { createFacility } from '../../helpers/create-facility';

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
});

describe('DELETE /v1/portal/facilities/:id', () => {
  let dealId;
  let documentToDeleteId;

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
    dealId = deal._id;

    const createFacilityResult = await createFacility({
      facility: {
        dealId,
        type: 'Bond',
      },
      user: MOCK_PORTAL_USER,
    });
    documentToDeleteId = new ObjectId(createFacilityResult.body._id);

    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withValidateAuditDetailsTests({
    makeRequest: async (auditDetails) =>
      await testApi
        .remove({
          dealId,
          user: MOCK_PORTAL_USER,
          auditDetails,
        })
        .to(`/v1/portal/facilities/${documentToDeleteId}`),
    validUserTypes: [AUDIT_USER_TYPES.PORTAL],
  });

  withDeleteOneTests({
    makeRequest: async () =>
      await testApi
        .remove({
          dealId,
          user: MOCK_PORTAL_USER,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to(`/v1/portal/facilities/${documentToDeleteId}`),
    collectionName: 'facilities',
    auditRecord: generateMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
    getDeletedDocumentId: () => documentToDeleteId,
  });

  it('removes the facility from the deal', async () => {
    await testApi
      .remove({
        dealId,
        user: MOCK_PORTAL_USER,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to(`/v1/portal/facilities/${documentToDeleteId}`);

    const getDealResponse = await testApi.get(`/v1/portal/deals/${dealId}`);

    const facilityOnDeal = getDealResponse.body.deal.facilities.find((facility) => facility._id === documentToDeleteId);
    expect(facilityOnDeal).toBeFalsy();
  });
});
