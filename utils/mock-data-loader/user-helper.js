const db = require('./db-client');
const crypto = require('crypto');

const createUser = async (user) => {
  console.info(`Creating user "${user.username}"`);

  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(user.password, salt, 10000, 64, 'sha512').toString('hex');

  const userToCreate = {
    'user-status': 'active',
    timezone: user.timezone || 'Europe/London',
    salt,
    hash,
    ...user,
  };

  userToCreate.password = '';
  userToCreate.passwordConfirm = '';

  const collection = await db.getCollection('users');
  await collection.insertOne(userToCreate);
};

const deleteAllUsers = async () => {
  const collection = await db.getCollection('users');
  await collection.deleteMany({});
}

module.exports = { createUser, deleteAllUsers };
