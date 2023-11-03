const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');

class UserRepository {
  async saveSignInCodeForUser({
    userId,
    signInCodeSalt,
    signInCodeHash,
  }) {
    const saltHex = signInCodeSalt.toString('hex');
    const hashHex = signInCodeHash.toString('hex');

    const userCollection = await db.getCollection('users');
    return userCollection.updateOne(
      { _id: { $eq: ObjectId(userId) } },
      { $set: { signInCode: { hash: hashHex, salt: saltHex } } }
    );
  }
}

module.exports = {
  UserRepository
};
