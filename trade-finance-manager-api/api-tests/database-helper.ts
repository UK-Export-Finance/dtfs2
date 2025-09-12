import { MongoDbCollectionName } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../server/drivers/db-client';

/**
 * Drops collections
 * @param collectionNames - collections to wipe
 */
export const wipeCollection = async (collectionNames: MongoDbCollectionName[]) => {
  const drop = async (collectionName: MongoDbCollectionName) => {
    const collection = await mongoDbClient.getCollection(collectionName);
    await collection.drop();
  };

  await Promise.all(collectionNames.map((collection) => drop(collection)));
};
