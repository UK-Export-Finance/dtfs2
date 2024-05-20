import { AuditDetails, DURABLE_FUNCTIONS_LOG, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { deleteManyWithAuditLogs } from '@ukef/dtfs2-common/change-stream';
import db from '../drivers/db-client';
import { deleteAllCompleteAcbsDurableFunctionLogs, deleteAllDurableFunctionLogs } from './durable-functions-repo';

// const mockDeleteManyWithAuditLogs = jest.fn();

jest.mock('@ukef/dtfs2-common/change-stream');

const { generateSystemAuditDetails } = jest.requireActual<{ generateSystemAuditDetails: () => AuditDetails }>('@ukef/dtfs2-common/change-stream');

describe('durable-functions-repo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const deleteTestCases = [
    {
      testCase: 'deleteAllDurableFunctionLogs',
      makeRequest: deleteAllDurableFunctionLogs,
      expectedDeleteManyCalledWith: {},
    },
    {
      testCase: 'deleteAllCompleteAcbsDurableFunctionLogs',
      makeRequest: deleteAllCompleteAcbsDurableFunctionLogs,
      expectedDeleteManyCalledWith: {
        $and: [{ type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } }, { status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED } }],
      },
    },
  ];

  describe.each(deleteTestCases)('$testCase', ({ expectedDeleteManyCalledWith, makeRequest }) => {
    const successfulDeleteManyResponse = { acknowledged: true };
    const successfulDeleteManyMock = async () => Promise.resolve(successfulDeleteManyResponse);

    if (process.env.CHANGE_STREAM_ENABLED === 'true') {
      it('calls deleteManyWithAuditLogs with the correct paramet', async () => {
        await makeRequest(generateSystemAuditDetails());

        expect(deleteManyWithAuditLogs).toHaveBeenCalledWith({
          filter: expectedDeleteManyCalledWith,
          collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
          db,
          auditDetails: generateSystemAuditDetails(),
        });
      });
    } else {
      it('calls the DB with the correct collection name', async () => {
        // Arrange
        const deleteManyMock = jest.fn(() => successfulDeleteManyMock());
        const getCollectionMock = jest.fn().mockResolvedValue({
          deleteMany: deleteManyMock,
        });
        jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

        // Act
        await makeRequest(generateSystemAuditDetails());

        // Assert
        expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);
      });

      it('calls the correct DB method with the expected parameters', async () => {
        // Arrange
        const deleteManyMock = jest.fn(() => successfulDeleteManyMock());
        const getCollectionMock = jest.fn().mockResolvedValue({
          deleteMany: deleteManyMock,
        });
        jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

        // Act
        await makeRequest(generateSystemAuditDetails());

        // Assert
        expect(deleteManyMock).toHaveBeenCalledWith(expectedDeleteManyCalledWith);
      });

      it('returns the result', async () => {
        // Arrange
        const deleteManyMock = jest.fn(() => successfulDeleteManyMock());
        const getCollectionMock = jest.fn().mockResolvedValue({
          deleteMany: deleteManyMock,
        });
        jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

        // Act
        const result = await makeRequest(generateSystemAuditDetails());

        // Assert
        expect(result).toEqual(successfulDeleteManyResponse);
      });
    }
  });
});
