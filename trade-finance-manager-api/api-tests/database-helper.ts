import { MongoDbCollectionName } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../src/drivers/db-client';

export const wipeCollection = async (collectionNames: MongoDbCollectionName[]) => {
  const drop = async (collectionName: MongoDbCollectionName) => {
    const collection = await mongoDbClient.getCollection(collectionName);
    await collection.drop();
  };

  return await Promise.all(collectionNames.map((collection) => drop(collection)));
};
