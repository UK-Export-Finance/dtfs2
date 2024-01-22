const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { transformDatabaseUser } = require('./transform-database-user');
const { InvalidUserIdError, InvalidUsernameError, UserNotFoundError, InvalidSessionIdentifierError } = require('../errors');
const { USER, SIGN_IN_LINK } = require('../../constants');

class UserRepository {
  async saveSignInTokenForUser({ userId, signInTokenSalt, signInTokenHash, expiry }) {
    this.#validateUserId(userId);

    const saltHex = signInTokenSalt.toString('hex');
    const hashHex = signInTokenHash.toString('hex');

    const userCollection = await db.getCollection('users');

    return userCollection.updateOne(
      { _id: { $eq: ObjectId(userId) } },
      { $push: { signInTokens: { $each: [{ hashHex, saltHex, expiry }], $slice: -SIGN_IN_LINK.MAX_SEND_COUNT } } },
    );
  }

  async deleteSignInTokensForUser(userId) {
    this.#validateUserId(userId);

    const userCollection = await db.getCollection('users');

    return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $unset: { signInTokens: '' } });
  }

  async incrementSignInLinkSendCount({ userId }) {
    this.#validateUserId(userId);

    const userCollection = await db.getCollection('users');

    const filter = { _id: { $eq: ObjectId(userId) } };
    const update = { $inc: { signInLinkSendCount: 1 } };
    const options = { returnDocument: 'after' };

    const userUpdate = await userCollection.findOneAndUpdate(filter, update, options);
    return userUpdate.value.signInLinkSendCount;
  }

  async setSignInLinkSendDate({ userId }) {
    this.#validateUserId(userId);

    const userCollection = await db.getCollection('users');
    return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInLinkSendDate: Date.now() } });
  }

  async resetSignInData({ userId }) {
    this.#validateUserId(userId);

    const userCollection = await db.getCollection('users');

    const unsetUpdate = {
      signInLinkSendCount: '',
      signInLinkSendDate: '',
      signInTokens: '',
    };

    return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $unset: unsetUpdate });
  }

  async updateLastLoginAndResetSignInData({ userId, sessionIdentifier }) {
    this.#validateUserId(userId);

    if (!sessionIdentifier) {
      throw new InvalidSessionIdentifierError(sessionIdentifier);
    }
    const userCollection = await db.getCollection('users');
    const setUpdate = {
      lastLogin: Date.now(),
      loginFailureCount: 0,
      sessionIdentifier,
    };
    const unsetUpdate = {
      signInLinkSendCount: '',
      signInLinkSendDate: '',
      signInTokens: '',
    };
    await userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: setUpdate, $unset: unsetUpdate });
  }

  async blockUser({ userId, reason }) {
    this.#validateUserId(userId);

    const userCollection = await db.getCollection('users');
    const update = {
      'user-status': USER.STATUS.BLOCKED,
      blockedStatusReason: reason,
    };
    await userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: update });
  }

  async findById(_id) {
    this.#validateUserId(_id);

    const collection = await db.getCollection('users');
    const user = await collection.findOne({ _id: { $eq: ObjectId(_id) } });
    if (!user) {
      throw new UserNotFoundError(_id);
    }
    return transformDatabaseUser(user);
  }

  async findByUsername(username) {
    this.#validateUsername(username);

    const collection = await db.getCollection('users');
    const user = collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } });

    if (!user) {
      throw new UserNotFoundError(username);
    }
    return transformDatabaseUser(user);
  }

  #validateUsername(username) {
    if (typeof username !== 'string') {
      throw new InvalidUsernameError(username);
    }
  }

  #validateUserId(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidUserIdError(userId);
    }
  }
}

module.exports = {
  UserRepository,
};
