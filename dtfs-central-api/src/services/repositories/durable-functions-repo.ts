import { Collection, DeleteResult } from 'mongodb';
import { DURABLE_FUNCTIONS_LOG } from '@ukef/dtfs2-common';
import db from '../../drivers/db-client';
import { DB_COLLECTIONS } from '../../constants';

const getDurableFunctionsLogCollection = async (): Promise<Collection> => db.getCollection(DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);

export const deleteAllDurableFunctionLogs = async (): Promise<DeleteResult> => {
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return durableFunctionLogsCollection.deleteMany({});
};

export const deleteAllAcbsDurableFunctionLogs = async (): Promise<DeleteResult> => {
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return durableFunctionLogsCollection.deleteMany({ type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } });
};
