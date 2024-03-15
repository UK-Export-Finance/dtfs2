import db from '../../drivers/db-client';
import { DB_COLLECTIONS } from '../../constants';
import { deleteAllCompleteAcbsDurableFunctionLogs, deleteAllDurableFunctionLogs } from './durable-functions-repo';
import { DURABLE_FUNCTIONS_LOG } from '@ukef/dtfs2-common';

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
      expectedDeleteManyCalledWith: { $and: [{ type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } }, { status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED } }] },
    },
  ];

  describe.each(deleteTestCases)('$testCase', ({ expectedDeleteManyCalledWith, makeRequest }) => {
    const successfulDeleteManyResponse = { acknowledged: true, deletedCount: 1 };
    const successfulDeleteManyMock = async () => Promise.resolve(successfulDeleteManyResponse);

    it('calls the DB with the correct collection name', async () => {
      // Arrange
      const deleteManyMock = jest.fn(() => successfulDeleteManyMock());
      const getCollectionMock = jest.fn().mockResolvedValue({
        deleteMany: deleteManyMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      await makeRequest();

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);
    });

    it('calls the correct DB method with the expected parameters', async () => {
      // Arrange
      const deleteManyMock = jest.fn(() => successfulDeleteManyMock());
      const getCollectionMock = jest.fn().mockResolvedValue({
        deleteMany: deleteManyMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      await makeRequest();

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
      const result = await makeRequest();

      // Assert
      expect(result).toEqual(successfulDeleteManyResponse);
    });
  });
});
