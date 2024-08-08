import z from 'zod';
import { MongoDbClient } from '@ukef/dtfs2-common/mongo-db-client';

const mongoDbConfigSchema = z.object({
  MONGODB_URI: z.string(),
  MONGO_INITDB_DATABASE: z.string(),
});

const getMongoDbClient = (): MongoDbClient => {
  const mongoDbConfig = mongoDbConfigSchema.parse(process.env);
  return new MongoDbClient({
    dbName: mongoDbConfig.MONGO_INITDB_DATABASE,
    dbConnectionString: mongoDbConfig.MONGODB_URI,
  });
};

export const mongoDbClient = getMongoDbClient();
