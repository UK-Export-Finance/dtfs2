const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const { generateArrayOfEmailsRegex } = require('./helpers/generateArrayOfEmailsRegex');
const handleFindByEmailsResult = require('./helpers/handleFindByEmailsResult');
const payloadVerification = require('./helpers/payload');
const { mapUserData } = require('./helpers/mapUserData.helper');
const { PAYLOAD } = require('../../../constants');

exports.findOne = async (_id, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid User Id');
  }

  const collection = await db.getCollection('tfm-users');

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, callback);
};

/**
 * findByEmails
 * Find a TFM user by email(s).
 * Throw an error if any of the following conditions are met:
 * - More than 1 matching user found.
 * - Unexpected DB response.
 * @param {Array} emails
 * @returns {Object} handleFindByEmailsResult
 */
exports.findByEmails = async (emails) => {
  try {
    console.info('Getting TFM user by emails');

    const collection = await db.getCollection('tfm-users');

    const emailsRegex = generateArrayOfEmailsRegex(emails);

    const users = await collection.find({ 'email': { $in: emailsRegex }}).toArray();

    return handleFindByEmailsResult(users);
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
  const tfmUser = { ...user };

  delete tfmUser.token;

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

  console.error('Error in createUser - payload validation failed');
  return false;
};

/**
 * updateUser
 * Update TFM user data
 * @param {String} userId: User ID
 * @param {Object} update: Update object
 * @param {Function} callback: Callback function. defaults to an empty function.
 * @returns {Function} Callback function
 */
exports.updateUser = async (userId, userData, callback = () => { }) => {
  try {
    console.info('Updating TFM user');

    if (!ObjectId.isValid(userId)) {
      throw new Error('Error Updating TFM user - Invalid User Id');
    }

    const collection = await db.getCollection('tfm-users');

    await collection.updateOne({ _id: { $eq: userId } }, { $set: userData }, {});

    callback();
  } catch (error) {
    console.error('Error Updating TFM user %s', error);

    throw new Error('Error Updating TFM user %s', error);
  }
};

/**
 * updateLastLoginAndResetSignInData
 * Update a user's "last login" and reset sign in data.
 * @param {Object} user
 * @param {String} sessionIdentifier
 * @param {Function} callback: Callback function. defaults to an empty function.
 * @returns {Function} Callback function
 */
exports.updateLastLoginAndResetSignInData = async (user, sessionIdentifier, callback = () => { }) => {
  try {
    console.info('Updating TFM user - last login, reset sign in data');

    if (!ObjectId.isValid(user._id)) {
      throw new Error('Error Updating TFM user - last login, reset sign in data - Invalid User Id');
    }

    const collection = await db.getCollection('tfm-users');

    const update = {
      lastLogin: Date.now(),
      sessionIdentifier,
    };

    await collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});

    callback();
  } catch (error) {
    console.error('Error Updating TFM user - last login, reset sign in data %s', error);

    throw new Error('Error Updating TFM user - last login, reset sign in data %s', error);
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
