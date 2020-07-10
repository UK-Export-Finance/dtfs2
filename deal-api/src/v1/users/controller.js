const moment = require('moment');
const { ObjectID } = require('mongodb');
const db = require('../../drivers/db-client');

exports.list = async (callback) => {
  const collection = await db.getCollection('users');

  collection.find({}).toArray(callback);
};

exports.findOne = async (_id, callback) => {
  const collection = await db.getCollection('users');

  collection.findOne({ _id: new ObjectID(_id) }, callback);
};

exports.findByUsername = async (username, callback) => {
  const collection = await db.getCollection('users');

  collection.findOne({ username }, callback);
};

exports.create = async (user, callback) => {
  const insert = {
    ...user,
    timezone: user.timezone || 'Europe/London',
  };

  const collection = await db.getCollection('users');
  const createUserResult = await collection.insertOne(insert);

  callback(null, createUserResult.ops[0]);
};

exports.update = async (_id, user, callback) => {
  const collection = await db.getCollection('users');
  await collection.updateOne({ _id: { $eq: new ObjectID(_id) } }, { $set: user }, {});

  callback(null, user);
};

exports.updateLastLogin = async (user, callback) => {
  const collection = await db.getCollection('users');
  const update = {
    lastLogin: moment().format('YYYY-MM-DD HH:mm'),
  };
  await collection.updateOne(
    { _id: { $eq: new ObjectID(user._id) } }, // eslint-disable-line no-underscore-dangle
    { $set: update },
    {},
  );

  callback();
};

exports.remove = async (_id, callback) => {
  const collection = await db.getCollection('users');
  const status = await collection.deleteOne({ _id: new ObjectID(_id) });

  callback(null, status);
};
