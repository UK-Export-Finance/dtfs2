const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');

class UserRepository {
  async saveSignInTokenForUser({
    userId,
    signInTokenSalt,
    signInTokenHash,
  }) {
    const saltHex = signInTokenSalt.toString('hex');
    const hashHex = signInTokenHash.toString('hex');

    const userCollection = await db.getCollection('users');
    return userCollection.updateOne(
      { _id: { $eq: ObjectId(userId) } },
      { $set: { signInToken: { hash: hashHex, salt: saltHex } } }
    );
  }
}

module.exports = {
  UserRepository
};
