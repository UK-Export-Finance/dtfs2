import { Collection } from 'mongodb';
import db from '../../src/drivers/db-client';

export const clearACBSLog = async () => {
  const collection = await db.getCollection('durable-functions-log') as Collection;
  return collection.deleteMany({});
};
