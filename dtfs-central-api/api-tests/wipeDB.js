const db = require('../src/drivers/db-client').default;
const { DB_COLLECTIONS } = require('../src/constants');

/**
 * @typedef {import('../src/types/db-models/db-collection-name').DbCollectionName} DbCollectionName
 */

/**
 * @param {DbCollectionName[]} collections
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
  const wiped = await wipe(Object.values(DB_COLLECTIONS));
  return wiped;
};

module.exports = {
  wipe,
  wipeAll,
};
