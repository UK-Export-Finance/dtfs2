import { Collection, DeleteResult } from 'mongodb';
import { DURABLE_FUNCTIONS_LOG } from '@ukef/dtfs2-common';
import db from '../../drivers/db-client';
import { DB_COLLECTIONS } from '../../constants';

const getDurableFunctionsLogCollection = async (): Promise<Collection> => db.getCollection(DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);

export const deleteAllDurableFunctionLogs = async (): Promise<DeleteResult> => {
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return durableFunctionLogsCollection.deleteMany({});
};

/**
 * Deletes all durable function logs that have the type "ACBS" and status "Complete"
 * @returns The result of the deletion
 */
export const deleteAllCompleteAcbsDurableFunctionLogs = async (): Promise<DeleteResult> => {
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return durableFunctionLogsCollection.deleteMany({
    $and: [{ type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } }, { status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED } }],
  });
};
