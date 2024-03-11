const { ObjectId } = require('mongodb');
const { USER } = require('../src/constants/index.js');
const MOCK_USERS = require('../src/v1/__mocks__/mock-users');
const db = require('../src/drivers/db-client');
const utils = require('../src/utils/crypto.util');

module.exports.initialise = async () => {
  let user = {
    ...MOCK_USERS[0],
    _id: ObjectId(MOCK_USERS[0]._id),
    status: USER.STATUS.ACTIVE
  };

  const collection = await db.getCollection('tfm-users');

  const dbUser = await collection.findOne({ username: { $eq: user.username }});
  if (dbUser) {
    user = dbUser;
  } else {
    await collection.insertOne(user);
  }

  const { sessionIdentifier, token } = utils.issueJWT(user);

  const update = {
    lastLogin: Date.now(),
    loginFailureCount: 0,
    sessionIdentifier,
  };
  await collection.updateOne({ username: { $eq: user.username } }, { $set: update }, {});

  user.token = token;

  return user;
};
