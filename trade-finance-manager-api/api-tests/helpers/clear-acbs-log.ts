import { Collection } from 'mongodb';
import { getCollection} from '../../src/drivers/db-client';

export const clearACBSLog = async () => {
  const collection = await getCollection('durable-functions-log') as Collection;
  return collection.deleteMany({});
};
