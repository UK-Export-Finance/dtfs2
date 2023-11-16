const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { transformDatabaseUser } = require('./transform-database-user');
const { InvalidUserIdError, InvalidUsernameError, UserNotFoundError } = require('../errors');
const { USER } = require('../../constants');

class UserRepository {
  async saveSignInTokenForUser({ userId, signInTokenSalt, signInTokenHash, expiry }) {
    const saltHex = signInTokenSalt.toString('hex');
    const hashHex = signInTokenHash.toString('hex');

    const userCollection = await db.getCollection('users');
    return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInToken: { hashHex, saltHex, expiry } } });
  }

  async deleteSignInTokenForUser(userId) {
    const userCollection = await db.getCollection('users');
    return userCollection.updateOne(
      { _id: { $eq: ObjectId(userId) } },
      { $unset: { signInToken: '' } }
    );
  }

  async incrementSignInLinkSendCount({ userId }) {
    const userCollection = await db.getCollection('users');

    const filter = { _id: { $eq: ObjectId(userId) } };
    const update = { $inc: { signInLinkSendCount: 1 } };
    const options = { returnDocument: 'after' };

    const userUpdate = await userCollection.findOneAndUpdate(filter, update, options);
    return userUpdate.value.signInLinkSendCount;
  }

  async setSignInLinkSendDate({ userId }) {
    const userCollection = await db.getCollection('users');
    return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInLinkSendDate: new Date() } });
  }

  async resetSignInLinkSendCountAndDate({ userId }) {
    const userCollection = await db.getCollection('users');
    return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInLinkSendCount: 0, signInLinkSendDate: null } });
  }

  async updateLastLogin({ userId, sessionIdentifier }) {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidUserIdError(userId);
    }

    if (!sessionIdentifier) {
      throw new Error('No session identifier was provided');
    }
    const userCollection = await db.getCollection('users');
    const update = {
      lastLogin: Date.now(),
      loginFailureCount: 0, // TODO DTFS2-6711: How do we want to deal with where and when we reset this?
      sessionIdentifier,
      signInLinkSendCount: 0,
      signInLinkSendDate: null,
    };
    await userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: update });
  }

  async blockUser({ userId, reason }) {
    const userCollection = await db.getCollection('users');
    const update = {
      'user-status': USER.STATUS.BLOCKED,
      userStatusCause: reason,
    };
    await userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: update });
  }

  async findById(_id) {
    if (!ObjectId.isValid(_id)) {
      throw new InvalidUserIdError(_id);
    }

    const collection = await db.getCollection('users');
    const user = await collection.findOne({ _id: { $eq: ObjectId(_id) } });
    if (!user) {
      throw new UserNotFoundError(_id);
    }
    return transformDatabaseUser(user);
  }

  async findByUsername(username) {
    if (typeof username !== 'string') {
      throw new InvalidUsernameError(username);
    }

    const collection = await db.getCollection('users');
    const user = collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } });

    if (!user) {
      throw new UserNotFoundError(username);
    }
    return transformDatabaseUser(user);
  }
}

module.exports = {
  UserRepository,
};
