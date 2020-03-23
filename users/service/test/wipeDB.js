
const collections = ['users'];

module.exports = async () => {
  const db = require('../src/db-driver/client');

  const drop = async (collection) => new Promise((resolve) => {
    db.getCollection(collection).then((collectionToDrop) => {
      collectionToDrop.drop(() => {
        resolve();
      });
    });
  });

  for (const collectionToDrop of collections) {
    await drop(collectionToDrop);
  }
};
