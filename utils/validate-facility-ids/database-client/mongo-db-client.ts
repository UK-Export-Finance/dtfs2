import z from 'zod';
import { MongoDbClient } from '@ukef/dtfs2-common/mongo-db-client';

const mongoDbConfigSchema = z.object({
  MONGODB_URI_QA: z.string(),
  MONGO_INITDB_DATABASE: z.string(),
});

/**
 * Gets the mongo db client
 * @returns The mongo db client
 */
const getMongoDbClient = (): MongoDbClient => {
  const mongoDbConfig = mongoDbConfigSchema.parse(process.env);
  return new MongoDbClient({
    dbName: mongoDbConfig.MONGO_INITDB_DATABASE,
    dbConnectionString: mongoDbConfig.MONGODB_URI_QA,
  });
};

export const mongoDbClient = getMongoDbClient();
