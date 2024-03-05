const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const { generateArrayOfEmailsRegex } = require('./helpers/generateArrayOfEmailsRegex');
const payloadVerification = require('./helpers/payload');
const { mapUserData } = require('./helpers/mapUserData.helper');
const { USER, PAYLOAD } = require('../../../constants');

/**
 * findByEmails
 * Find a TFM user by email(s).
 * Throw an error if any of the following conditions are met:
 * - More than 1 matching user found.
 * - User is blocked.
 * - User is disabled.
 * - Unexpected DB response.
 * @param {Array} emails
 * @returns {Object}
 */
exports.findByEmails = async (emails) => {
  try {
    console.info('Getting TFM user by emails');

    const collection = await db.getCollection('tfm-users');

    const emailsRegex = generateArrayOfEmailsRegex(emails);

    const users = await collection.find({ 'email': { $in: emailsRegex }}).toArray();

    if (users.length === 0) {
      console.info('Getting TFM user by emails - no user found');

      return { found: false }
    }

    if (users.length > 1) {
      console.info('Getting TFM user by emails - More than 1 matching user found: %O', users);

      return { found: true, canProceed: false };
    }

    if (users[0].disabled) {
      // TODO: should we remove functionality to disable users in TFM, so disabling is done in Active directory.
      console.info('Getting TFM user by emails - User is disabled: %O', users[0]);

      return { found: true, canProceed: false };
    }

    if (users[0].status === 'blocked') {
      // TODO: should we remove functionality to block users in TFM, so block is done in Active directory.
      console.info('Getting TFM user by emails - User is blocked: %O', users[0]);

      return { found: true, canProceed: false };
    }

    return {
      found: true,
      canProceed: true,
      ...users[0],
    };
  } catch (error) {
    console.error('Error getting TFM user by emails - Unexpected DB response %O', error);

    throw new Error('Error getting TFM user by emails - Unexpected DB response %O', error);
  }
};

exports.findByUsername = async (username, callback) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const collection = await db.getCollection('tfm-users');
  collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } }, callback);
};

exports.createUser = async (user) => {
  const collection = await db.getCollection('tfm-users');
  const tfmUser = {
    ...user,
    status: USER.STATUS.ACTIVE,
  };

  delete tfmUser.token;
  delete tfmUser.password;

  if (payloadVerification(tfmUser, PAYLOAD.TFM.USER)) {
    const createUserResult = await collection.insertOne(tfmUser);

    const { insertedId: userId } = createUserResult;

    if (!ObjectId.isValid(userId)) {
      throw new Error('User creation failed. Invalid User Id');
    }

    const createdUser = await collection.findOne({ _id: { $eq: userId } });
    const mapUser = mapUserData(createdUser);
    return mapUser;
  }

  return false;
};

exports.updateLastLoginAndResetSignInData = async (user, sessionIdentifier, callback) => {
  try {
    console.info('Updating TFM user - last login, reset sign in data');

    if (!ObjectId.isValid(user._id)) {
      throw new Error('Error Updating TFM user - last login, reset sign in data - Invalid User Id');
    }

    const collection = await db.getCollection('tfm-users');

    const update = {
      lastLogin: Date.now(),
      loginFailureCount: 0,
      sessionIdentifier,
    };
    await collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});

    callback();
  } catch (error) {
    console.error('Error Updating TFM user - last login, reset sign in data');

    throw new Error('Error Updating TFM user - last login, reset sign in data');
  }
};

exports.removeTfmUserById = async (_id, callback) => {
  if (ObjectId.isValid(_id)) {
    const collection = await db.getCollection('tfm-users');
    const status = await collection.deleteOne({ _id: { $eq: ObjectId(_id) } });

    return callback(null, status);
  }

  return callback('Invalid TFM user id', 400);
};