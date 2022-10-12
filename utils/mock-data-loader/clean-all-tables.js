const tokenFor = require('./temporary-token-handler');

const db = require('./database/mongo-client');

const wipe = async (collections) => {
  const response = collections.map(async (name) => {
    const collection = await db.getCollection(name);
    return collection.deleteMany({});
  });
  return Promise.all(response);
};
const wipeAll = async () => wipe(['banks', 'deals', 'facilities', 'users', 'tfm-deals', 'tfm-facilities', 'tfm-users', 'tfm-teams', 'eligibilityCriteria', 'mandatoryCriteria']);

const cleanAllTables = async () => {
  await wipeAll();
  await tokenFor({
    username: 'admin',
    email: 'admin-2',
    password: 'AbC!2345',
    roles: ['maker', 'editor'],
    bank: { id: '*' },
  });
};

module.exports = {
  wipeAll,
  cleanAllTables,
};
