import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generateSystemAuditDatabaseRecord, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { generateMockSystemAuditDatabaseRecord, withDeleteManyTests } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { testApi } from '../../test-api';
import { withValidateAuditDetailsTests } from '../../helpers/with-validate-audit-details.api-tests';
import { mongoDbClient } from '../../../src/drivers/db-client';

describe('DELETE /v1/portal/durable-functions', () => {
  let logsToDeleteIds;

  beforeEach(async () => {
    const durableFunctionsLogCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);
    const insertionResult = await durableFunctionsLogCollection.insertMany([
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
        .to(`/v1/portal/durable-functions`),
    validUserTypes: ['none', 'portal', 'system', 'tfm'],
  });

  withDeleteManyTests({
    makeRequest: () =>
      testApi
        .remove({
          auditDetails: generateSystemAuditDetails(),
        })
        .to(`/v1/portal/durable-functions`),
    collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
    auditRecord: generateMockSystemAuditDatabaseRecord(),
    getDeletedDocumentIds: () => logsToDeleteIds,
    expectedSuccessResponseBody: {},
  });

  it('returns 200 if there are no durable function logs to delete', async () => {
    const { status: firstStatus } = await testApi
      .remove({
        auditDetails: generateSystemAuditDetails(),
      })
      .to(`/v1/portal/durable-functions`);
    const { status: secondStatus } = await testApi
      .remove({
        auditDetails: generateSystemAuditDetails(),
      })
      .to(`/v1/portal/durable-functions`);

    expect(firstStatus).toBe(200);
    expect(secondStatus).toBe(200);
  });
});
