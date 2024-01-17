const db = require('../src/drivers/db-client');

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
  const wiped = await wipe(['deals', 'users', 'tfm-deals', 'tfm-facilities', 'tfm-users', 'tfm-teams']);
  return wiped;
};

module.exports = {
  wipe,
  wipeAll,
};
