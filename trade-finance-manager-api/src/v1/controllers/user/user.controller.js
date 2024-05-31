const { ObjectId } = require('mongodb');
const {
  generateAuditDatabaseRecordFromAuditDetails,
  deleteOne,
  generateTfmUserAuditDatabaseRecord,
  generateNoUserLoggedInAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/change-stream');
const { PAYLOAD_VERIFICATION } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const handleFindByEmailsResult = require('./helpers/handleFindByEmailsResult');
const { generateArrayOfEmailsRegex } = require('./helpers/generateArrayOfEmailsRegex');
const db = require('../../../drivers/db-client');
const { mapUserData } = require('./helpers/mapUserData.helper');

/**
 * findOne
 * Find a TFM user by id
 * Throw an error if user id parameter is not valid.
 * @param {string} _id
 * @param {(error: string | null, user: object) => void} callback
 * @returns {Promise<Void>}
 */
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
 * @returns {Promise<import('src/types/auth/get-user-response').GetUserResponse>} - result status and maybe user object
 */
exports.findByEmails = async (emails) => {
  try {
    console.info('Getting TFM user by emails');

    const collection = await db.getCollection('tfm-users');

    const emailsRegex = generateArrayOfEmailsRegex(emails);

    const users = await collection.find({ email: { $in: emailsRegex } }).toArray();

    const getUserResponse = handleFindByEmailsResult(users);

    return getUserResponse;
  } catch (error) {
    console.error('Error getting TFM user by emails - Unexpected DB response %O', error);
    throw new Error('Error getting TFM user by emails - Unexpected DB response %O', error);
  }
};

/**
 * findByUsername
 * Find a TFM user by username
 * Throw an error if username parameter is not string.
 * @param {string} username
 * @param {(error: string | null, user: object) => void} callback
 * @returns {Promise<Void>}
 */
exports.findByUsername = async (username, callback) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const collection = await db.getCollection('tfm-users');
  collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } }, callback);
};

/**
 * @param {object} user to create
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - logged in user or NoUser during first SSO login
 * @param {(error: string | null, createdUser: object) => void} callback
 * @returns
 */
exports.createUser = async (user, auditDetails) => {
  const collection = await db.getCollection('tfm-users');
  const tfmUser = {
    ...user,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };
  delete tfmUser.token;

  if (isVerifiedPayload({ payload: tfmUser, template: PAYLOAD_VERIFICATION.TFM.USER })) {
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
 * @param {string} _id of the user to update
 * @param {object} update to make to the user
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - logged in user
 * @param {(error: string | null, updatedUser: object) => void} callback
 * @returns {Promise<Void>}
 */
exports.updateUser = async (_id, update, sessionUser, callback = () => {}) => {
  try {
    console.info('Updating TFM user');

    if (!ObjectId.isValid(_id)) {
      throw new Error('Error Updating TFM user - Invalid User Id');
    }

    const userUpdate = {
      ...update,

      auditRecord: sessionUser?._id ? generateTfmUserAuditDatabaseRecord(sessionUser._id) : generateNoUserLoggedInAuditDatabaseRecord(),
    };

    const collection = await db.getCollection('tfm-users');
    await collection.updateOne({ _id: { $eq: ObjectId(_id) } }, { $set: userUpdate }, {});
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
 * @returns {Promise<Function>} Callback function
 */
exports.updateLastLoginAndResetSignInData = async (user, sessionIdentifier, callback = () => {}) => {
  try {
    console.info('Updating TFM user - last login, reset sign in data');

    if (!ObjectId.isValid(user._id)) {
      throw new Error('Error Updating TFM user - last login, reset sign in data - Invalid User Id');
    }

    const collection = await db.getCollection('tfm-users');

    const update = {
      lastLogin: Date.now(),

      sessionIdentifier,
      auditRecord: generateTfmUserAuditDatabaseRecord(user._id),
    };

    await collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});

    callback();
  } catch (error) {
    console.error('Error Updating TFM user - last login, reset sign in data %s', error);
    throw new Error('Error Updating TFM user - last login, reset sign in data %s', error);
  }
};

exports.removeTfmUserById = async (_id, auditDetails, callback) => {
  if (!ObjectId.isValid(_id)) {
    return callback('Invalid TFM user id', 400);
  }

  try {
    await deleteOne({
      documentId: new ObjectId(_id),
      collectionName: 'tfm-users',
      db,
      auditDetails,
    });
    return callback(null, 200);
  } catch (error) {
    return callback(error, 500);
  }
};
