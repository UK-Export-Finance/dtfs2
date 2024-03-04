const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const db = require('../src/drivers/db-client').default;

/**
 * @param {import('@ukef/dtfs2-common').MongoDbCollectionName[]} collections
 */
const wipe = async (collections) => {
  const drop = async (collection) => new Promise((resolve) => {
    db.getCollection(collection)
      .then((c) => c.drop(() => resolve()));
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

module.exports = {
  wipe,
  wipeAll,
};
