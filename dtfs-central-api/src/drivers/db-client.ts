import { Collection, Db as DbConnection, MongoClient, WithoutId } from 'mongodb';
import { asString } from '@ukef/dtfs2-common';
import { dbName, url } from '../config/database.config';
import { DbCollectionName } from '../types/db-models/db-collection-name';
import { DbModel } from '../types/db-models/db-model';

let client: MongoClient | undefined;

let connection: DbConnection | undefined;

const dbConnect = async (): Promise<{ client: MongoClient; connection: DbConnection }> => {
  client = await MongoClient.connect(asString(url, 'url'));
  connection = client.db(dbName);
  return { client, connection };
};

const getConnection = async (): Promise<DbConnection> => {
  if (!connection) {
    return (await dbConnect()).connection;
  }

  return connection;
};

export const getClient = async () => {
  if (!client) {
    return (await dbConnect()).client;
  }

  return client;
};

export const getCollection = async <TCollectionName extends DbCollectionName>(
  collectionName: TCollectionName,
): Promise<Collection<WithoutId<DbModel<TCollectionName>>>> => {
  if (!connection) {
    return (await getConnection()).collection(collectionName);
  }
  return connection.collection(collectionName);
};

export const close = async () => {
  if (client) {
    await client.close();
  }
};

export default {
  getClient,
  getCollection,
  close,
};
