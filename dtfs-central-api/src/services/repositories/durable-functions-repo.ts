import { Collection, DeleteResult } from 'mongodb';
import db from '../../drivers/db-client';
import { DB_COLLECTIONS } from '../../constants';

const getDurableFunctionsLogCollection = async (): Promise<Collection> => db.getCollection(DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);

export const deleteAllDurableFunctionLogs = async (): Promise<DeleteResult> => {
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return await durableFunctionLogsCollection.deleteMany({});
};

export const deleteAllAcbsDurableFunctionLogs = async (): Promise<DeleteResult> => {
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return await durableFunctionLogsCollection.deleteMany({ type: { $eq: 'ACBS' } });
};
