const actualDb = jest.requireActual('../../../src/drivers/db-client').default;
const mockGetCollection = jest.fn(actualDb.getCollection.bind(actualDb));

jest.mock('../../../src/drivers/db-client', () => ({
  __esModule: true,
  default: {
    getCollection: mockGetCollection,
    getClient: actualDb.getClient.bind(actualDb),
    getConnection: actualDb.getConnection.bind(actualDb),
  },
}));

const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { generateSystemAuditDatabaseRecord, generateSystemAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateMockSystemAuditDatabaseRecord, withDeleteManyTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');
const { default: db } = require('../../../src/drivers/db-client');

describe('DELETE /v1/portal/durable-functions', () => {
  let logToDeleteIds;

  beforeEach(async () => {
    const durableFunctionsLogCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);
    const insertionResult = await durableFunctionsLogCollection.insertMany([
      { aField: 'aValue', auditRecord: generateSystemAuditDatabaseRecord() },
      { anotherField: 'anotherValue', auditRecord: generateSystemAuditDatabaseRecord() },
    ]);
    logToDeleteIds = Object.values(insertionResult.insertedIds);
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
    makeRequest: async () => {
      await api
        .remove({
          auditDetails: generateSystemAuditDetails(),
        })
        .to(`/v1/portal/durable-functions`);
    },
    collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
    auditRecord: generateMockSystemAuditDatabaseRecord(),
    getDeletedDocumentIds: () => logToDeleteIds,
    mockGetCollection,
  });

  it('returns 200', async () => {
    const deleteResponse = await api
      .remove({
        auditDetails: generateSystemAuditDetails(),
      })
      .to(`/v1/portal/durable-functions`);
    expect(deleteResponse.status).toBe(200);
  });
});
