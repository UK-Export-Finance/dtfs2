

const wipe = async (collections) => {
  const db = require('../src/drivers/db-client');

  const drop = async collection => new Promise(async (resolve, reject) => {
    const collectionToDrop = await db.getCollection(collection);

    collectionToDrop.drop((err, delOK) => {
      resolve();
    });
  });

  for (collection of collections) {
    await drop(collection);
  }
};

const wipeAll = async () => {
  await wipe(['deals', 'banks', 'transactions', 'bondCurrencies', 'countries', 'industrySectors', 'mandatoryCriteria', 'users']);
};

module.exports = {
  wipe,
  wipeAll,
}
