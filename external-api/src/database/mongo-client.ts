import { MongoDbClient, MongoDbCollectionName } from '@ukef/dtfs2-common';
import { dbName, url } from '../config';

const mongoDbClient = new MongoDbClient({ dbName, dbConnectionString: url });

export const getConnection = async () => mongoDbClient.getConnection();

export const getCollection = async <CollectionName extends MongoDbCollectionName>(collectionName: CollectionName) =>
  mongoDbClient.getCollection<CollectionName>(collectionName);

export const close = async () => mongoDbClient.close();
