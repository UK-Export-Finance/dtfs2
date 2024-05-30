import { MongoDbClient } from '@ukef/dtfs2-common/mongo-db-client';
import { MongoDbCollectionName } from '@ukef/dtfs2-common';
import { dbName, url } from './database.config';

const mongoDbClient = new MongoDbClient({ dbName, dbConnectionString: url });

export const get = async () => await mongoDbClient.getConnection();

export const getCollection = async <CollectionName extends MongoDbCollectionName>(collectionName: CollectionName) =>
  await mongoDbClient.getCollection<CollectionName>(collectionName);

export const getConnection = async () => await mongoDbClient.getConnection();

export const close = async () => await mongoDbClient.close();
