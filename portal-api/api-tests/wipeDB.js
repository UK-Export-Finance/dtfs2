const db = require('../src/drivers/db-client');
const { DB_COLLECTIONS } = require('./fixtures/constants');

const wipe = async (collections) => {
  const drop = async (collection) => new Promise((resolve) => {
    db.getCollection(collection)
      .then((c) => c.drop(() => resolve()));
  });

  const dropPromises = [];
  for (const collection of collections) {
    dropPromises.push(drop(collection));
  }
  const dropped = await Promise.all(dropPromises);
  return dropped;
};

const wipeAll = async () => {
  const collections = Object.values(DB_COLLECTIONS);
  const wiped = await wipe(collections);
  return wiped;
};

const deleteUser = async (user) => {
  const { username } = user;

  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const usersCollection = await db.getCollection(DB_COLLECTIONS.USERS);
  await usersCollection.deleteMany({ username: { $eq: username } });
};

module.exports = {
  wipe,
  wipeAll,
  deleteUser,
};
