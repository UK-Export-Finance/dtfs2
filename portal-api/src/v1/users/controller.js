const { ObjectId } = require('mongodb');
const now = require('../../now');
const db = require('../../drivers/db-client');
const sendEmail = require('../email');
const businessRules = require('../../config/businessRules');
const { sanitizeUser } = require('./sanitizeUserData');
const utils = require('../../crypto/utils');
const CONSTANTS = require('../../constants');
const { isValidEmail } = require('../../utils/string');
const { USER, PAYLOAD } = require('../../constants');
const payloadVerification = require('../helpers/payload');

/**
 * Send a password update confirmation email with update timestamp.
 * @param {String} emailAddress User email address
 * @param {String} timestamp Password update timestamp
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
    timeZoneName: 'short'
  });

  await sendEmail(
    CONSTANTS.EMAIL_TEMPLATE_IDS.PASSWORD_UPDATE,
    emailAddress,
    {
      timestamp: formattedTimestamp,
    },
  );
};
exports.sendPasswordUpdateEmail = sendPasswordUpdateEmail;

const createPasswordToken = async (email) => {
  if (typeof email !== 'string') {
    throw new Error('Invalid Email');
  }

  const collection = await db.getCollection('users');

  const user = await collection.findOne({ email: { $eq: email } }, { collation: { locale: 'en', strength: 2 } });

  if (!user) {
    return false;
  }

  const { hash } = utils.genPasswordResetToken(user);

  const userUpdate = {
    resetPwdToken: hash,
    resetPwdTimestamp: `${Date.now()}`,
  };

  if (!ObjectId.isValid(user._id)) {
    throw new Error('Invalid User Id');
  }

  await collection.updateOne({ _id: { $eq: user._id } }, { $set: userUpdate }, {});

  return hash;
};
exports.createPasswordToken = createPasswordToken;

const sendBlockedEmail = async (emailAddress) => {
  await sendEmail(
    CONSTANTS.EMAIL_TEMPLATE_IDS.BLOCKED,
    emailAddress,
    {},
  );
};

const sendUnblockedEmail = async (emailAddress) => {
  await sendEmail(
    CONSTANTS.EMAIL_TEMPLATE_IDS.UNBLOCKED,
    emailAddress,
    {},
  );
};

const sendNewAccountEmail = async (user, resetToken) => {
  const emailAddress = user.username;

  const variables = {
    username: user.username,
    firstname: user.firstname,
    surname: user.surname,
    bank: (user.bank && user.bank.name) ? user.bank.name : '',
    roles: user.roles.join(','),
    status: user['user-status'],
    resetToken,
  };

  await sendEmail(
    CONSTANTS.EMAIL_TEMPLATE_IDS.NEW_ACCOUNT,
    emailAddress,
    variables,
  );
};

exports.list = async (callback) => {
  const collection = await db.getCollection('users');

  collection.find().toArray(callback);
};

exports.findOne = async (_id, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid User Id');
  }

  const collection = await db.getCollection('users');

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, callback);
};

exports.findByUsername = async (username, callback) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const collection = await db.getCollection('users');
  collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } }, callback);
};

exports.findByEmail = async (email, callback) => {
  if (!isValidEmail(email)) {
    throw new Error('Invalid Email');
  }

  const collection = await db.getCollection('users');
  collection.findOne({ email: { $eq: email } }, callback);
};

exports.create = async (user, callback) => {
  const insert = {
    'user-status': USER.STATUS.ACTIVE,
    timezone: USER.TIMEZONE.DEFAULT,
    ...user,
  };

  delete insert?.autoCreatePassword;
  delete insert?.password;
  delete insert?.passwordConfirm;

  if (payloadVerification(insert, PAYLOAD.PORTAL.USER)) {
    const collection = await db.getCollection('users');
    const createUserResult = await collection.insertOne(insert);

    const { insertedId: userId } = createUserResult;

    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid User Id');
    }

    const createdUser = await collection.findOne({ _id: { $eq: userId } });

    const sanitizedUser = sanitizeUser(createdUser);

    // TODO DTFS2-6621 - Remove conditional check
    if (sanitizedUser.username && sanitizedUser.username.includes('@')) {
      const resetPasswordToken = await createPasswordToken(sanitizedUser.email);
      await sendNewAccountEmail(sanitizedUser, resetPasswordToken);
    }

    return callback(null, sanitizedUser);
  }

  return callback('Invalid user payload', user);
};

exports.update = async (_id, update, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid User Id');
  }

  const userUpdate = { ...update };
  const collection = await db.getCollection('users');

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, async (error, existingUser) => {
    if (existingUser['user-status'] !== USER.STATUS.BLOCKED && userUpdate['user-status'] === USER.STATUS.BLOCKED) {
      // User is being blocked.
      await sendBlockedEmail(existingUser.username);
    }

    if (existingUser['user-status'] === USER.STATUS.BLOCKED && userUpdate['user-status'] === USER.STATUS.ACTIVE) {
      // User is being re-activated.
      await sendUnblockedEmail(existingUser.username);
    }

    // Password update
    if (userUpdate.password) {
      const { password: newPassword } = userUpdate;
      const { salt: oldSalt, hash: oldHash, blockedPasswordList: oldBlockedPasswordList = [] } = existingUser;
      // don't save the raw password or password confirmation to mongo...
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
      if (oldSalt && oldHash) {
        userUpdate.blockedPasswordList = oldBlockedPasswordList.concat([{ oldSalt, oldHash }]);
      }
      userUpdate.loginFailureCount = 0;
      userUpdate.passwordUpdatedAt = Date.now();

      // Send password update email notification to the user
      sendPasswordUpdateEmail(existingUser.email, userUpdate.passwordUpdatedAt);
    }

    delete userUpdate.password;
    delete userUpdate.passwordConfirm;
    delete userUpdate.currentPassword;
    await collection.updateOne({ _id: { $eq: ObjectId(_id) } }, { $set: userUpdate }, {});
    callback(null, userUpdate);
  });
};

exports.updateLastLogin = async (user, sessionIdentifier, callback) => {
  if (!ObjectId.isValid(user._id)) {
    throw new Error('Invalid User Id');
  }

  const collection = await db.getCollection('users');
  const update = {
    lastLogin: now(),
    loginFailureCount: 0,
    sessionIdentifier,
  };
  await collection.updateOne(
    { _id: { $eq: ObjectId(user._id) } },
    { $set: update },
    {},
  );

  callback();
};

exports.incrementFailedLoginCount = async (user) => {
  if (!ObjectId.isValid(user._id)) {
    throw new Error('Invalid User Id');
  }

  const failureCount = user.loginFailureCount ? user.loginFailureCount + 1 : 1;
  const thresholdReached = (failureCount >= businessRules.loginFailureCount_Limit);

  const collection = await db.getCollection('users');
  const update = {
    loginFailureCount: failureCount,
    lastLoginFailure: now(),
    'user-status': thresholdReached ? USER.STATUS.BLOCKED : user['user-status'],
  };

  await collection.updateOne(
    { _id: { $eq: ObjectId(user._id) } },
    { $set: update },
    {},
  );

  if (thresholdReached) {
    await sendBlockedEmail(user.username);
  }
};

exports.disable = async (_id, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid User Id');
  }

  const collection = await db.getCollection('users');
  const userUpdate = {
    disabled: true,
  };

  const status = await collection.updateOne({ _id: { $eq: ObjectId(_id) } }, { $set: userUpdate }, {});

  callback(null, status);
};

exports.remove = async (_id, callback) => {
  if (ObjectId.isValid(_id)) {
    const collection = await db.getCollection('users');
    const status = await collection.deleteOne({ _id: { $eq: ObjectId(_id) } });

    return callback(null, status);
  }

  return callback('Invalid portal user id', 400);
};
