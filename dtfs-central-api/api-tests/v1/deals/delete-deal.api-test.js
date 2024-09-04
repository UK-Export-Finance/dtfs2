import { AUDIT_USER_TYPES } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { withDeleteOneTests, generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';

import { testApi } from '../../test-api';
import { DEALS } from '../../../src/constants';
import aDeal from '../deal-builder';
import { MOCK_PORTAL_USER } from '../../mocks/test-users/mock-portal-user';
import { withValidateAuditDetailsTests } from '../../helpers/with-validate-audit-details.api-tests';
import { createDeal } from '../../helpers/create-deal';

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
});

describe('DELETE /v1/portal/deals', () => {
  let dealToDeleteId;

  beforeEach(async () => {
    const postResult = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
    dealToDeleteId = new ObjectId(postResult.body._id);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withValidateAuditDetailsTests({
    makeRequest: (auditDetails) =>
      testApi
        .remove({
          auditDetails,
        })
        .to(`/v1/portal/deals/${dealToDeleteId}`),
    validUserTypes: [AUDIT_USER_TYPES.PORTAL],
  });

  withDeleteOneTests({
    makeRequest: () =>
      testApi
        .remove({
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to(`/v1/portal/deals/${dealToDeleteId}`),
    collectionName: 'deals',
    auditRecord: generateMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
    getDeletedDocumentId: () => dealToDeleteId,
  });
});
