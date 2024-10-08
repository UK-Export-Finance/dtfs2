import { MongoDbClient } from '@ukef/dtfs2-common/mongo-db-client';
import { dbName, url } from './database.config';

export const mongoDbClient = new MongoDbClient({ dbName, dbConnectionString: url });
