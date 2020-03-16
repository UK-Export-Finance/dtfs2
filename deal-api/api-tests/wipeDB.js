
const collections = ['deals', 'banks', 'transactions', 'bondCurrencies', 'countries', 'industrySectors', 'mandatoryCriteria'];

module.exports = async () => {
  const db = require('../src/db-driver/client');

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
