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
const { generateMockPortalUserAuditDatabaseRecord, withDeleteManyTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generatePortalAuditDetails, generateSystemAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream');
const app = require('../../../src/createApp');
const db = require('../../../src/drivers/db-client').default;
const api = require('../../api')(app);
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');

describe('DELETE v1/portal/cron-jobs', () => {
  let logToDeleteIds;

  beforeEach(async () => {
    const cronJobLogsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
    const insertionResult = await cronJobLogsCollection.insertMany([
      { aField: 'aValue', auditRecord: generateSystemAuditDatabaseRecord() },
      { anotherField: 'anotherValue', auditRecord: generateSystemAuditDatabaseRecord() },
    ]);
    logToDeleteIds = Object.values(insertionResult.insertedIds);
  });

  withValidateAuditDetailsTests({
    makeRequest: (auditDetails) =>
      api
        .remove({
          auditDetails,
        })
        .to(`/v1/portal/cron-jobs`),
    validUserTypes: ['none', 'portal', 'system', 'tfm'],
  });

  withDeleteManyTests({
    makeRequest: async () => {
      await api
        .remove({
          auditDetails: generatePortalAuditDetails('abcdef123456abcdef123456'),
        })
        .to(`/v1/portal/cron-jobs`);
    },
    collectionName: MONGO_DB_COLLECTIONS.CRON_JOB_LOGS,
    auditRecord: generateMockPortalUserAuditDatabaseRecord('abcdef123456abcdef123456'),
    getDeletedDocumentIds: () => logToDeleteIds,
    mockGetCollection,
  });

  it('returns 200', async () => {
    const deleteResponse = await api
      .remove({
        auditDetails: generatePortalAuditDetails('abcdef123456abcdef123456'),
      })
      .to(`/v1/portal/cron-jobs`);
    expect(deleteResponse.status).toBe(200);
  });
});
