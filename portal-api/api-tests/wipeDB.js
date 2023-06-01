const db = require('../src/drivers/db-client');

const wipe = async (collections) => {
  // eslint-disable-next-line no-async-promise-executor
  const drop = async (collection) => new Promise(async (resolve) => {
    const collectionToDrop = await db.getCollection(collection);

    collectionToDrop.drop(() => {
      resolve();
    });
  });

  const dropPromises = [];
  for (const collection of collections) {
    dropPromises.push(drop(collection));
  }
  const dropped = await Promise.all(dropPromises);
  return dropped;
};

const wipeAll = async () => {
  const wiped = await wipe([
    'deals',
    'facilities',
    'banks',
    'transactions',
    'industrySectors',
    'mandatoryCriteria',
    'eligibilityCriteria',
    'users',
    'gef-mandatoryCriteriaVersioned',
  ]);
  return wiped;
};

module.exports = {
  wipe,
  wipeAll,
};
