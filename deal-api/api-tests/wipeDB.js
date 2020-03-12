module.exports = async () => {

  return new Promise( async(resolve, reject ) => {
    const db = require('../src/db-driver/client');
    const collection = await db.getCollection("deals");

    collection.drop(function(err, delOK) {
      if (err)
        reject(err);
      else
        resolve();
    });

  });
}
