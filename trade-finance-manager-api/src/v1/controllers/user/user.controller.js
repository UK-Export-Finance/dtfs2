const { ObjectId } = require('mongodb');
const { generateAuditDatabaseRecordFromAuditDetails, deleteOne } = require('@ukef/dtfs2-common/change-stream');
const { PAYLOAD_VERIFICATION, DocumentNotDeletedError } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const { UserService } = require('../../services/user.service');
const api = require('../../api');
const { mongoDbClient: db } = require('../../../drivers/db-client');
const { mapUserData } = require('./helpers/mapUserData.helper');
const { USER } = require('../../../constants');
const utils = require('../../../utils/crypto.util');

const businessRules = { loginFailureCount: 5 };

exports.findOne = async (_id, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid User Id');
  }

  const collection = await db.getCollection('tfm-users');

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, callback);
};

exports.findByUsername = async (username, callback) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const collection = await db.getCollection('tfm-users');
  collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } }, callback);
};

/**
 * @param {Object} user to create
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - logged in user
 * @param {(error: string | null, createdUser: object) => void} callback
 * @returns
 */
exports.create = async (user, auditDetails, callback) => {
  const collection = await db.getCollection('tfm-users');
  const tfmUser = {
    ...user,
    status: USER.STATUS.ACTIVE,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  delete tfmUser.token;
  delete tfmUser.password;

  if (isVerifiedPayload({ payload: tfmUser, template: PAYLOAD_VERIFICATION.TFM.USER })) {
    const createUserResult = await collection.insertOne(tfmUser);

    const { insertedId: userId } = createUserResult;

    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid User Id');
    }

    const createdUser = await collection.findOne({ _id: { $eq: userId } });
    const mapUser = mapUserData(createdUser);

    return callback(null, mapUser);
  }

  return callback('Invalid TFM user payload', user);
};

/**
 * @param {string} _id of the user to update
 * @param {Object} update to make to the user
 * @param {import('@ukef/dtfs2-common').AuditDetails} auditDetails - logged in user
 * @param {(error: string | null, updatedUser: object) => void} callback
 */
exports.update = async (_id, update, auditDetails, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid User Id');
  }

  const userUpdate = {
    ...update,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };
  const collection = await db.getCollection('tfm-users');

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, async (error, existingUser) => {
    if (userUpdate.password) {
      // we're updating the password, so do the dance...
      const { password: newPassword } = userUpdate;
      const { salt: oldSalt, hash: oldHash, blockedPasswordList: oldBlockedPasswordList = [] } = existingUser;
      // remove the raw password
      delete userUpdate.password;
      delete userUpdate.passwordConfirm;
      delete userUpdate.currentPassword;

      // create new salt/hash for the new password
      const { salt, hash } = utils.genPassword(newPassword);
      // queue update of salt+hash, ie store the encrypted password
      userUpdate.salt = salt;
      userUpdate.hash = hash;
      // queue the addition of the old salt/hash to our list of blocked passwords that we re-check
      // in 'passwordsCannotBeReUsed' rule
      userUpdate.blockedPasswordList = oldBlockedPasswordList.concat([{ oldSalt, oldHash }]);
    }

    await collection.updateOne({ _id: { $eq: ObjectId(_id) } }, { $set: userUpdate }, {});

    callback(null, userUpdate);
  });
};

/**
 * Creates or updates a TFM user from an Entra user.
 * Used during the login process to keep the TFM user in sync with the Entra user.
 * @param {object} upsertUserParams
 * @param {import('@ukef/dtfs2-common').EntraIdUser} upsertUserParams.entraUser
 * @param {import('@ukef/dtfs2-common').AuditDetails} upsertUserParams.auditDetails
 *
 */
exports.upsertUser = async ({ entraUser, auditDetails }) => {
  const userUpdateFromEntraIdUser = UserService.transformEntraUserToTfmUserUpsert(entraUser);
  return await api.upsertUser({ userUpdateFromEntraIdUser, auditDetails });
};

exports.updateLastLoginAndResetSignInData = async (user, sessionIdentifier, auditDetails, callback) => {
  if (!ObjectId.isValid(user._id)) {
    throw new Error('Invalid User Id');
  }

  const collection = await db.getCollection('tfm-users');
  const update = {
    lastLogin: Date.now(),
    loginFailureCount: 0,
    sessionIdentifier,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };
  await collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});

  callback();
};

exports.incrementFailedLoginCount = async (user, auditDetails) => {
  if (!ObjectId.isValid(user._id)) {
    throw new Error('Invalid User Id');
  }

  const failureCount = user.loginFailureCount ? user.loginFailureCount + 1 : 1;
  const thresholdReached = failureCount >= businessRules.loginFailureCount;

  const collection = await db.getCollection('tfm-users');
  const update = {
    loginFailureCount: failureCount,
    lastLoginFailure: Date.now(),
    status: thresholdReached ? USER.STATUS.BLOCKED : user.status,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  await collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});
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
    if (error instanceof DocumentNotDeletedError) {
      return callback(error, 404);
    }
    return callback(error, 500);
  }
};
