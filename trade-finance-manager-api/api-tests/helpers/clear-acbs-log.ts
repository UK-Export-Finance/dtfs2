import { Collection } from 'mongodb';
import { mongoDbClient } from '../../server/drivers/db-client';

export const clearACBSLog = async () => {
  const collection = (await mongoDbClient.getCollection('durable-functions-log')) as Collection;
  return collection.deleteMany({});
};
