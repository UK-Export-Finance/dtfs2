import { MongoDbCollectionName } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../src/drivers/db-client';

export const wipeCollection = async (collectionNames: MongoDbCollectionName[]) => {
  const drop = async (collectionName: MongoDbCollectionName) => {
    const collection = await mongoDbClient.getCollection(collectionName);
    await collection.drop();
  };

  const dropPromises = [];
  for (const collection of collectionNames) {
    dropPromises.push(drop(collection));
  }
  const dropped = await Promise.all(dropPromises);
  return dropped;
};
