
const wipe = async (collections) => {
  const db = require('../src/drivers/db-client');

  const drop = async (collection) => new Promise(async (resolve, reject) => {
    const collectionToDrop = await db.getCollection(collection);

    collectionToDrop.drop((err, delOK) => {
      resolve();
    });
  });

  const dropPromises = [];
  for (collection of collections) {
    dropPromises.push(drop(collection));
  }
  const dropped = await Promise.all(dropPromises);
  return dropped;
};

const wipeAll = async () => {
  const wiped = await wipe(['deals', 'banks', 'transactions', 'currencies', 'countries', 'industrySectors', 'mandatoryCriteria', 'eligibilityCriteria', 'users']);
  return wiped;
};

module.exports = {
  wipe,
  wipeAll,
};
