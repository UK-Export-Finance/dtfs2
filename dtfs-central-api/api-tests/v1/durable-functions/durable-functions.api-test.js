const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { generateSystemAuditDatabaseRecord, generateSystemAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateMockSystemAuditDatabaseRecord, withDeleteManyTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');
const { mongoDbClient } = require('../../../src/drivers/db-client');

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
      api
        .remove({
          auditDetails,
        })
        .to(`/v1/portal/durable-functions`),
    validUserTypes: ['none', 'portal', 'system', 'tfm'],
  });

  withDeleteManyTests({
    makeRequest: () =>
      api
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
    const { status: firstStatus } = await api
      .remove({
        auditDetails: generateSystemAuditDetails(),
      })
      .to(`/v1/portal/durable-functions`);
    const { status: secondStatus } = await api
      .remove({
        auditDetails: generateSystemAuditDetails(),
      })
      .to(`/v1/portal/durable-functions`);

    expect(firstStatus).toBe(200);
    expect(secondStatus).toBe(200);
  });
});
