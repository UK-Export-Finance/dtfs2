import { MongoDbClient } from '@ukef/dtfs2-common/mongo-db-client';
import { dbName, url } from '../config/database.config';

const mongoDbClient = new MongoDbClient({ dbName, dbConnectionString: url });

export default mongoDbClient;
