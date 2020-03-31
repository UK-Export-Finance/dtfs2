const db = require('../../db-driver/client');

exports.list = async (callback) => {
  const collection = await db.getCollection('users');

  collection.find({}).toArray(callback);
};

exports.findOne = async (username, callback) => {
  const collection = await db.getCollection('users');

  collection.findOne({ username }, callback);
};

exports.create = async (user, callback) => {
  const collection = await db.getCollection('users');
  const createUserResult = await collection.insertOne(user);

  callback(null, createUserResult.ops[0]);
};

exports.update = async (username, user, callback) => {
  const collection = await db.getCollection('users');
  await collection.updateOne({ username: { $eq: username } }, { $set: user }, {});

  callback(null, user);
};

exports.remove = async (username, callback) => {
  const collection = await db.getCollection('users');
  const status = await collection.deleteOne({ username });

  callback(null, status);
};
