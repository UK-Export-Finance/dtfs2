const { ObjectID } = require('mongodb');
const now = require('../../now');
const db = require('../../drivers/db-client');
const sendEmail = require('../email');
const businessRules = require('../../config/businessRules');
const { BLOCKED, ACTIVE } = require('../../constants/user').STATUS;

const sendBlockedEmail = async (emailAddress) => {
  const EMAIL_TEMPLATE_ID = '82506983-cb85-4f33-b962-922b850be7ac';

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    emailAddress,
    {},
  );
};

const sendUnblockedEmail = async (emailAddress) => {
  const EMAIL_TEMPLATE_ID = '44959d08-6389-4f27-a6be-2faae8bea711';

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    emailAddress,
    {},
  );
};

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
    'user-status': ACTIVE,
    ...user,
    timezone: user.timezone || 'Europe/London',
  };

  const collection = await db.getCollection('users');
  const createUserResult = await collection.insertOne(insert);

  callback(null, createUserResult.ops[0]);
};

exports.update = async (_id, user, callback) => {
  const collection = await db.getCollection('users');

  collection.findOne({ _id: new ObjectID(_id) }, async (err, existingUser) => {
    // --- this section could (/should?) have been done as a separate endpoints for the actions
    //  of blocking+unblocking.. we've done that elsewhere... but seemed overkill here
    if (existingUser['user-status'] !== BLOCKED && user['user-status'] === BLOCKED) {
      // the user is being blocked..
      await sendBlockedEmail(existingUser.username);
    }

    if (existingUser['user-status'] === BLOCKED && user['user-status'] === ACTIVE) {
      // the user is being re-activated..
      await sendUnblockedEmail(existingUser.username);
    }
    //---

    await collection.updateOne({ _id: { $eq: new ObjectID(_id) } }, { $set: user }, {});

    callback(null, user);
  });
};

exports.updateLastLogin = async (user, callback) => {
  const collection = await db.getCollection('users');
  const update = {
    lastLogin: now(),
    loginFailureCount: 0,
  };
  await collection.updateOne(
    { _id: { $eq: new ObjectID(user._id) } }, // eslint-disable-line no-underscore-dangle
    { $set: update },
    {},
  );

  callback();
};

exports.incrementFailedLoginCount = async (user) => {
  const failureCount = user.loginFailureCount ? user.loginFailureCount + 1 : 1;
  const thresholdReached = (failureCount >= businessRules.loginFailureCount_Limit);

  const collection = await db.getCollection('users');
  const update = {
    loginFailureCount: failureCount,
    lastLoginFailure: now(),
    'user-status': thresholdReached ? BLOCKED : user['user-status'],
  };

  await collection.updateOne(
    { _id: { $eq: new ObjectID(user._id) } }, // eslint-disable-line no-underscore-dangle
    { $set: update },
    {},
  );

  if (thresholdReached) {
    await sendBlockedEmail(user.username);
  }
};

exports.remove = async (_id, callback) => {
  const collection = await db.getCollection('users');
  const status = await collection.deleteOne({ _id: new ObjectID(_id) });

  callback(null, status);
};
