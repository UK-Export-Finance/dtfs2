import { DeleteResult } from 'mongodb';
import { DURABLE_FUNCTIONS_LOG, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import db from '../drivers/db-client';

const getDurableFunctionsLogCollection = async () => db.getCollection(MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);

export const deleteAllDurableFunctionLogs = async (): Promise<DeleteResult> => {
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return durableFunctionLogsCollection.deleteMany({});
};

/**
 * Deletes all durable function logs that have the type "ACBS" and status "Completed"
 * @returns The result of the deletion
 */
export const deleteAllCompleteAcbsDurableFunctionLogs = async (): Promise<DeleteResult> => {
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return durableFunctionLogsCollection.deleteMany({
    $and: [
      { type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } },
      { status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED } },
    ],
  });
};
