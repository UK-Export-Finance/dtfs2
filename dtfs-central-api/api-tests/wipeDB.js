import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../src/drivers/db-client';

/**
 * @param {import('@ukef/dtfs2-common').MongoDbCollectionName[]} collections
 */
const wipe = async (collections) => {
  const drop = async (collection) =>
    new Promise((resolve) => {
      db.getCollection(collection).then((c) => c.drop(() => resolve()));
    });

  const dropPromises = [];

  for (const collection of collections) {
    dropPromises.push(drop(collection));
  }
  const dropped = await Promise.all(dropPromises);
  return dropped;
};

const wipeAll = async () => {
  const wiped = await wipe(Object.values(MONGO_DB_COLLECTIONS));
  return wiped;
};
export { wipe, wipeAll };
