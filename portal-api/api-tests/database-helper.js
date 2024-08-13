/* eslint-disable no-param-reassign */
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { produce } = require('immer');
const { mongoDbClient: db } = require('../src/drivers/db-client');

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
  const collections = Object.values(MONGO_DB_COLLECTIONS);
  const wiped = await wipe(collections);

  return wiped;
};

/**
 * @param {string[]} bankIds - the bank id.
 *
 * Note this takes an `id` not the ObjectId `_id`
 */
const deleteBanks = async (bankIds) => {
  const bankCollections = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  await bankCollections.deleteMany({
    $or: bankIds.map((id) => ({
      id: {
        $eq: id,
      },
    })),
  });
};

const deleteUser = async (user) => {
  const { username } = user;

  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const usersCollection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  await usersCollection.deleteMany({ username: { $eq: username } });
};

const unsetUserProperties = async ({ username, properties }) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const unsetUpdate = produce({}, (draft) => {
    properties.forEach((property) => {
      draft[property] = '';
    });
  });

  const usersCollection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  await usersCollection.updateOne({ username: { $eq: username } }, { $unset: unsetUpdate });
};

const setUserProperties = async ({ username, update }) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const usersCollection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  await usersCollection.updateOne({ username: { $eq: username } }, { $set: update });
};

const getUserById = async (userId) => (await db.getCollection(MONGO_DB_COLLECTIONS.USERS)).findOne({ _id: { $eq: ObjectId(userId) } });

module.exports = {
  wipe,
  wipeAll,
  deleteUser,
  unsetUserProperties,
  setUserProperties,
  getUserById,
  deleteBanks,
};
