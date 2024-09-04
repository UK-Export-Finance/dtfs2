import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generateMockPortalUserAuditDatabaseRecord, withDeleteManyTests } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { generatePortalAuditDetails, generateSystemAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { testApi } from '../../test-api';
import { withValidateAuditDetailsTests } from '../../helpers/with-validate-audit-details.api-tests';
import { MOCK_PORTAL_USER } from '../../mocks/test-users/mock-portal-user';

describe('DELETE v1/portal/cron-jobs', () => {
  let logsToDeleteIds;

  beforeEach(async () => {
    const cronJobLogsCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
    const insertionResult = await cronJobLogsCollection.insertMany([
      { aField: 'aValue', auditRecord: generateSystemAuditDatabaseRecord() },
      { anotherField: 'anotherValue', auditRecord: generateSystemAuditDatabaseRecord() },
    ]);
    logsToDeleteIds = Object.values(insertionResult.insertedIds);
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
        .to(`/v1/portal/cron-jobs`),
    validUserTypes: ['none', 'portal', 'system', 'tfm'],
  });

  withDeleteManyTests({
    makeRequest: () =>
      testApi
        .remove({
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to(`/v1/portal/cron-jobs`),
    collectionName: MONGO_DB_COLLECTIONS.CRON_JOB_LOGS,
    auditRecord: generateMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
    getDeletedDocumentIds: () => logsToDeleteIds,
    expectedSuccessResponseBody: {},
  });

  it('returns 200 if there are no cron job logs to delete', async () => {
    const { status: firstStatus } = await testApi
      .remove({
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to(`/v1/portal/cron-jobs`);
    const { status: secondStatus } = await testApi
      .remove({
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to(`/v1/portal/cron-jobs`);

    expect(firstStatus).toBe(200);
    expect(secondStatus).toBe(200);
  });
});
