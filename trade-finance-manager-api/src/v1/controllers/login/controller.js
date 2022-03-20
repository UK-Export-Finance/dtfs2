const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const { BLOCKED, ACTIVE } = require('../../../constants/user.constant').DEAL_STATUS;
const { sanitizeUser } = require('./sanitizeUserData');
const utils = require('../../../utils/crypto.util');

const businessRules = {
  loginFailureCount_Limit: 3,
};

exports.findOne = async (_id, callback) => {
  const collection = await db.getCollection('tfm-users');

  collection.findOne({ _id: ObjectId(_id) }, callback);
};

exports.findByUsername = async (username, callback) => {
  const collection = await db.getCollection('tfm-users');

  collection.findOne({ username }, callback);
};

exports.create = async (user, callback) => {
  const insert = {
    status: ACTIVE,
    ...user,
  };

  delete insert.password;

  const collection = await db.getCollection('tfm-users');
  const createUserResult = await collection.insertOne(insert);

  const { insertedId: userId } = createUserResult;

  const createdUser = await collection.findOne({ _id: userId });

  const sanitizedUser = sanitizeUser(createdUser);

  callback(null, sanitizedUser);
};

exports.update = async (_id, update, callback) => {
  const userUpdate = { ...update };
  const collection = await db.getCollection('tfm-users');

  collection.findOne({ _id: ObjectId(_id) }, async (err, existingUser) => {
    if (userUpdate.password) {
      // we're updating the password, so do the dance...
      const { password: newPassword } = userUpdate;
      const { salt: oldSalt, hash: oldHash, blockedPasswordList: oldBlockedPasswordList = [] } = existingUser;
      // don't save the raw password or password confirmation to mongo...
      delete userUpdate.password;
      delete userUpdate.passwordConfirm;

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

exports.updateLastLogin = async (user, sessionIdentifier, callback) => {
  const collection = await db.getCollection('tfm-users');
  const update = {
    lastLogin: Date.now(),
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
  const failureCount = user.loginFailureCount ? user.loginFailureCount + 1 : 1;
  const thresholdReached = (failureCount >= businessRules.loginFailureCount_Limit);

  const collection = await db.getCollection('tfm-users');
  const update = {
    loginFailureCount: failureCount,
    lastLoginFailure: Date.now(),
    'user-status': thresholdReached ? BLOCKED : user['user-status'],
  };

  await collection.updateOne(
    { _id: { $eq: ObjectId(user._id) } },
    { $set: update },
    {},
  );
};

exports.remove = async (_id, callback) => {
  const collection = await db.getCollection('tfm-users');
  const status = await collection.deleteOne({ _id: ObjectId(_id) });

  callback(null, status);
};
