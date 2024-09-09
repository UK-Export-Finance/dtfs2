import { when } from 'jest-when';
import { DeleteResult } from 'mongodb';
import { AuditDetails, DURABLE_FUNCTIONS_LOG, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { deleteMany } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient as db } from '../drivers/db-client';
import { deleteAllCompleteAcbsDurableFunctionLogs, deleteAllDurableFunctionLogs } from './durable-functions-repo';

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
    it('calls deleteMany with the correct parameters', async () => {
      await makeRequest(generateSystemAuditDetails());

      expect(deleteMany).toHaveBeenCalledWith({
        filter: expectedDeleteManyCalledWith,
        collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
        db,
        auditDetails: generateSystemAuditDetails(),
      });
    });

    it('returns the response from deleteMany', async () => {
      const mockDeleteManyResponse: DeleteResult = { acknowledged: true, deletedCount: 1 };
      when(deleteMany)
        .calledWith({
          filter: expectedDeleteManyCalledWith,
          collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
          db,
          auditDetails: generateSystemAuditDetails(),
        })
        .mockResolvedValueOnce(mockDeleteManyResponse);

      const response = await makeRequest(generateSystemAuditDetails());

      expect(response).toEqual(mockDeleteManyResponse);
    });
  });
});
