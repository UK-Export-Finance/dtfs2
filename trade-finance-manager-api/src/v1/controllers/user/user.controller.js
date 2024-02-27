const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const payloadVerification = require('./helpers/payload');
const { mapUserData } = require('./helpers/mapUserData.helper');
const { USER, PAYLOAD } = require('../../../constants');
const { UserNotFoundError } = require('../../errors');

exports.findByEmails = async (emails) => {
  const collection = await db.getCollection('tfm-users');
  const emailsRegex = emails.map(email => new RegExp(`^${email}$`, 'i'));
  const users = await collection.find({ 'email': { $in: emailsRegex }}).toArray();
  if (users.length === 0) {
    throw new UserNotFoundError('No matching users found', emails);
  }
  if (users.length > 1) {
    throw new Error('More than 1 matching user found %O', users);
  }
  if (users[0].disabled) {
    throw new Error('User is disabled %O', users[0]);
  }
  if (users[0].status === 'blocked') {
    throw new Error('User is blocked %O', users[0]);
  }
  if (users[0]?.username) {
    return users[0];
  }
  throw new Error('Unexpected DB response %O', users);
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
