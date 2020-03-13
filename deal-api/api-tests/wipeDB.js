
const collections = ["deals","banks","transactions"];

module.exports = async () => {
  const db = require('../src/db-driver/client');

  const drop = async(collection) => {

    return new Promise( async(resolve, reject ) => {
      const collectionToDrop = await db.getCollection(collection);

      collectionToDrop.drop(function(err, delOK) {
        resolve();

      });

    });
  }

  for (collection of collections) {
    await drop(collection);
  }
}
