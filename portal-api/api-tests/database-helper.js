const { ObjectId } = require('mongodb');
const db = require('../src/drivers/db-client');
const { produce } = require('immer');

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
  const wiped = await wipe([
    'deals',
    'facilities',
    'banks',
    'transactions',
    'industrySectors',
    'mandatoryCriteria',
    'eligibilityCriteria',
    'users',
    'gef-mandatoryCriteriaVersioned',
  ]);
  return wiped;
};

const deleteUser = async (user) => {
  const { username } = user;

  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const usersCollection = await db.getCollection('users');
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

  const usersCollection = await db.getCollection('users');
  await usersCollection.updateOne({ username: { $eq: username } }, { $unset: unsetUpdate });
};

const setUserProperties = async ({ username, update }) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const usersCollection = await db.getCollection('users');
  await usersCollection.updateOne({ username: { $eq: username } }, { $set: update });
};

const getUserById = async (userId) => (await db.getCollection('users')).findOne({ _id: { $eq: ObjectId(userId) } });

module.exports = {
  wipe,
  wipeAll,
  deleteUser,
  unsetUserProperties,
  setUserProperties,
  getUserById,
};
