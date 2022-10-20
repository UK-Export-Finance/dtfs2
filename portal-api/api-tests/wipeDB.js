/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const db = require('../src/drivers/db-client');

const wipe = async (collections) => {
  for (const name of collections) {
    const collection = await db.getCollection(name);
    collection.deleteMany({});
  }
};

const wipeAll = () => wipe(['banks', 'deals', 'users', 'tfm-deals', 'tfm-facilities', 'tfm-users', 'tfm-teams']);

module.exports = {
  wipe,
  wipeAll,
};
