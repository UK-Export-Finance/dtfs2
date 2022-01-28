const db = require('../src/drivers/db-client');

const wipe = async (collections) => {
  const drop = async (collection) => new Promise(async (resolve, reject) => {
    const collectionToDrop = await db.getCollection(collection);

    collectionToDrop.drop((err, delOK) => {
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
