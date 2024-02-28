import { MongoDbClient, MongoDbCollectionName } from '@ukef/dtfs2-common';
import { dbName, url } from '../config/database.config';

const mongoDbClient = new MongoDbClient({ dbName, dbConnectionString: url });

export const get = async () => await mongoDbClient.getConnection();

export const getCollection = async <CollectionName extends MongoDbCollectionName>(collectionName: CollectionName) =>
  await mongoDbClient.getCollection<CollectionName>(collectionName);

export const close = async () => await mongoDbClient.close();
