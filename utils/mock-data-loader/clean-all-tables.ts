import { MONGO_DB_COLLECTIONS, MongoDbCollectionName } from '@ukef/dtfs2-common';
import { logger } from './helpers/logger.helper';
import { mongoDbClient } from './database/database-client';

const cleanTable = async (tableName: MongoDbCollectionName): Promise<void> => {
  logger.info(`cleaning ${tableName}`, { depth: 1 });
  const collection = await mongoDbClient.getCollection(tableName);
  await collection.deleteMany({});
};

export const cleanAllTables = async (): Promise<void> => {
  logger.info('cleaning tables');
  for (const tableName of Object.values(MONGO_DB_COLLECTIONS)) {
    await cleanTable(tableName);
  }
};
