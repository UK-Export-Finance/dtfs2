const db = require('../src/drivers/db-client');

const wipe = (collections) => collections.forEach(async (name) => {
  const collection = await db.getCollection(name);
  await collection.deleteMany({});
});

const wipeAll = () => wipe(['banks', 'deals', 'users', 'tfm-deals', 'tfm-facilities', 'tfm-users', 'tfm-teams']);

module.exports = {
  wipe,
  wipeAll,
};
