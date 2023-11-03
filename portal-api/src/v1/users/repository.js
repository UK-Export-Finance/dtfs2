const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');

class UserRepository {
  async saveSignInTokenForUser({ userId, signInTokenSalt, signInTokenHash }) {
    const saltHex = signInTokenSalt.toString('hex');
    const hashHex = signInTokenHash.toString('hex');

    const userCollection = await db.getCollection('users');
    return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInToken: { hash: hashHex, salt: saltHex } } });
  }

  async findById(_id) {
    if (!ObjectId.isValid(_id)) {
      throw new Error('Invalid User Id');
    }
    const collection = await db.getCollection('users');

    try {
      collection.findOne({ _id: { $eq: ObjectId(_id) } });
    } catch (e) {
      const error = new Error(`Failed to find user by id: ${_id}`);
      error.cause = e;
      throw error;
    }
  }

  async findByUsername(username) {
    if (typeof username !== 'string') {
      throw new Error('Invalid Username');
    }

    const collection = await db.getCollection('users');

    try {
      const user = collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } });
      if (!user) {
        throw new Error('User object not defined');
      }
      return user;
    } catch (e) {
      const error = new Error(`Failed to find user by name: ${username}`);
      error.cause = e;
      throw error;
    }
  }
}

module.exports = {
  UserRepository,
};
