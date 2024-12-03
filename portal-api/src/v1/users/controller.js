const { MONGO_DB_COLLECTIONS, DocumentNotDeletedError } = require('@ukef/dtfs2-common');
const { PORTAL_USER } = require('@ukef/dtfs2-common/schemas');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const { ObjectId } = require('mongodb');
const { generateAuditDatabaseRecordFromAuditDetails, deleteOne } = require('@ukef/dtfs2-common/change-stream');
const { getNowAsEpochMillisecondString } = require('../helpers/date');
const { mongoDbClient: db } = require('../../drivers/db-client');
const sendEmail = require('../email');
const businessRules = require('../../config/businessRules');
const { sanitizeUser } = require('./sanitizeUserData');
const utils = require('../../crypto/utils');
const CONSTANTS = require('../../constants');
const { isValidEmail } = require('../../utils/string');
const { USER } = require('../../constants');
const { InvalidUserIdError, InvalidEmailAddressError, UserNotFoundError } = require('../errors');
const InvalidSessionIdentifierError = require('../errors/invalid-session-identifier.error');
const { transformDatabaseUser } = require('./transform-database-user');

/**
 * Send a password update confirmation email with update timestamp.
 * @param {string} emailAddress User email address
 * @param {string} timestamp Password update timestamp
 */
const sendPasswordUpdateEmail = async (emailAddress, timestamp) => {
  const formattedTimestamp = new Date(Number(timestamp)).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    year: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  });

  await sendEmail(CONSTANTS.EMAIL_TEMPLATE_IDS.PASSWORD_UPDATE, emailAddress, {
    timestamp: formattedTimestamp,
  });
};
exports.sendPasswordUpdateEmail = sendPasswordUpdateEmail;

const createPasswordToken = async (email, userService, auditDetails) => {
  if (typeof email !== 'string') {
    throw new Error('Invalid Email');
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

  const user = await collection.findOne({ email: { $eq: email } }, { collation: { locale: 'en', strength: 2 } });

  if (!user || userService.isUserBlockedOrDisabled(user)) {
    console.info('Not creating password token due to invalid or missing user');
    return false;
  }

  const { hash } = utils.genPasswordResetToken(user);

  const userUpdate = {
    resetPwdToken: hash,
    resetPwdTimestamp: `${Date.now()}`,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  if (!ObjectId.isValid(user._id)) {
    throw new InvalidUserIdError(user._id);
  }

  await collection.updateOne({ _id: { $eq: user._id } }, { $set: userUpdate }, {});

  return hash;
};
exports.createPasswordToken = createPasswordToken;

const sendBlockedEmail = async (emailAddress) => {
  await sendEmail(CONSTANTS.EMAIL_TEMPLATE_IDS.BLOCKED, emailAddress, {});
};
exports.sendBlockedEmail = sendBlockedEmail;

const sendUnblockedEmail = async (emailAddress) => {
  await sendEmail(CONSTANTS.EMAIL_TEMPLATE_IDS.UNBLOCKED, emailAddress, {});
};

const sendNewAccountEmail = async (user, resetToken) => {
  const emailAddress = user.username;

  const variables = {
    username: user.username,
    firstname: user.firstname,
    surname: user.surname,
    bank: user.bank && user.bank.name ? user.bank.name : '',
    roles: user.roles.join(','),
    status: user['user-status'],
    resetToken,
  };

  await sendEmail(CONSTANTS.EMAIL_TEMPLATE_IDS.NEW_ACCOUNT, emailAddress, variables);
};

exports.list = async (callback) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

  collection.find().toArray(callback);
};

/**
 * @deprecated Use findById inside user repository instead
 */
exports.findOne = async (_id, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new InvalidUserIdError(_id);
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, callback);
};

/**
 * @deprecated Use findByUsername inside user repository instead
 */
exports.findByUsername = async (username, callback) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } }, callback);
};

exports.findByEmail = async (email) => {
  if (!isValidEmail(email)) {
    throw new InvalidEmailAddressError(email);
  }
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  const user = await collection.findOne({ email: { $eq: email } });

  if (!user) {
    throw new UserNotFoundError(email);
  }

  return transformDatabaseUser(user);
};

exports.create = async (user, userService, auditDetails, callback) => {
  const insert = {
    'user-status': USER.STATUS.ACTIVE,
    timezone: USER.TIMEZONE.DEFAULT,
    ...user,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  delete insert?.autoCreatePassword;
  delete insert?.password;
  delete insert?.passwordConfirm;

  if (!isVerifiedPayload({ payload: insert, template: PORTAL_USER.CREATE })) {
    return callback('Invalid user payload', user);
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  const createUserResult = await collection.insertOne(insert);

  const { insertedId: userId } = createUserResult;

  if (!ObjectId.isValid(userId)) {
    throw new InvalidUserIdError(userId);
  }

  const createdUser = await collection.findOne({ _id: { $eq: userId } });

  const sanitizedUser = sanitizeUser(createdUser);

  const resetPasswordToken = await createPasswordToken(sanitizedUser.email, userService, auditDetails);
  await sendNewAccountEmail(sanitizedUser, resetPasswordToken);

  return callback(null, sanitizedUser);
};

exports.update = async (_id, update, auditDetails, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new InvalidUserIdError(_id);
  }

  const userSetUpdate = { ...update };
  let userUnsetUpdate;
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, async (error, existingUser) => {
    if (existingUser['user-status'] !== USER.STATUS.BLOCKED && userSetUpdate['user-status'] === USER.STATUS.BLOCKED) {
      // User is being blocked.
      await sendBlockedEmail(existingUser.email);
    }

    if (existingUser['user-status'] === USER.STATUS.BLOCKED && userSetUpdate['user-status'] === USER.STATUS.ACTIVE) {
      // User is being re-activated.
      userSetUpdate.loginFailureCount = 0;
      userUnsetUpdate = {
        signInLinkSendDate: '',
        signInLinkSendCount: '',
        blockedStatusReason: '',
      };

      await sendUnblockedEmail(existingUser.email);
    }

    // Password update
    if (userSetUpdate.password) {
      const { password: newPassword } = userSetUpdate;
      const { salt: oldSalt, hash: oldHash, blockedPasswordList: oldBlockedPasswordList = [] } = existingUser;
      // don't save the raw password or password confirmation to mongo...
      delete userSetUpdate.password;
      delete userSetUpdate.passwordConfirm;
      delete userSetUpdate.currentPassword;

      // create new salt/hash for the new password
      const { salt, hash } = utils.genPassword(newPassword);
      // queue update of salt+hash, ie store the encrypted password
      userSetUpdate.salt = salt;
      userSetUpdate.hash = hash;
      // queue the addition of the old salt/hash to our list of blocked passwords that we re-check
      // in 'passwordsCannotBeReUsed' rule
      if (oldSalt && oldHash) {
        userSetUpdate.blockedPasswordList = oldBlockedPasswordList.concat([{ oldSalt, oldHash }]);
      }
      userSetUpdate.loginFailureCount = 0;
      userSetUpdate.passwordUpdatedAt = Date.now();

      // Send password update email notification to the user
      sendPasswordUpdateEmail(existingUser.email, userSetUpdate.passwordUpdatedAt);
    }

    delete userSetUpdate.password;
    delete userSetUpdate.passwordConfirm;
    delete userSetUpdate.currentPassword;

    if (
      !isVerifiedPayload({
        payload: userSetUpdate,
        template: PORTAL_USER.UPDATE,
      })
    ) {
      return callback('Invalid user payload', update);
    }

    userSetUpdate.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const userUpdate = { $set: userSetUpdate };
    if (userUnsetUpdate) {
      userUpdate.$unset = userUnsetUpdate;
    }
    const updatedUser = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(_id) } }, userUpdate, {
      returnDocument: 'after',
    });
    return callback(null, updatedUser);
  });
};

exports.updateSessionIdentifier = async (user, sessionIdentifier, auditDetails, callback) => {
  if (!ObjectId.isValid(user._id)) {
    throw new InvalidUserIdError(user._id);
  }

  if (!sessionIdentifier) {
    throw new InvalidSessionIdentifierError(sessionIdentifier);
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  const update = {
    sessionIdentifier,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  await collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});

  callback();
};

exports.incrementFailedLoginCount = async (user, auditDetails) => {
  if (!ObjectId.isValid(user._id)) {
    throw new InvalidUserIdError(user._id);
  }
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

  const failureCount = user.loginFailureCount ? user.loginFailureCount + 1 : 1;
  const thresholdReached = failureCount >= businessRules.loginFailureCount_Limit;

  const update = thresholdReached
    ? {
        'user-status': USER.STATUS.BLOCKED,
        blockedStatusReason: USER.STATUS_BLOCKED_REASON.INVALID_PASSWORD,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      }
    : {
        loginFailureCount: failureCount,
        lastLoginFailure: getNowAsEpochMillisecondString(),
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      };

  await collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});

  if (thresholdReached) {
    await sendBlockedEmail(user.username);
  }
};

exports.disable = async (_id, auditDetails, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new InvalidUserIdError(_id);
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  const userUpdate = {
    disabled: true,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  const status = await collection.updateOne({ _id: { $eq: ObjectId(_id) } }, { $set: userUpdate }, {});

  callback(null, status);
};

exports.remove = async (_id, auditDetails, callback) => {
  if (!ObjectId.isValid(_id)) {
    return callback('Invalid portal user id', 400);
  }

  try {
    await deleteOne({
      documentId: new ObjectId(_id),
      collectionName: MONGO_DB_COLLECTIONS.USERS,
      db,
      auditDetails,
    });

    return callback(null, 200);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return callback(error, 404);
    }
    console.error('Deleting a user threw an error %o', error);
    return callback(error, 500);
  }
};
