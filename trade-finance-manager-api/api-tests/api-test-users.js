// const { ObjectId } = require('mongodb');
// const MOCK_USERS = require('../src/v1/__mocks__/mock-users');
// const db = require('../src/drivers/db-client');
// const utils = require('../src/utils/crypto.util');

// module.exports.initialise = async () => { // TODO: remove, clean up.
// //module.exports.initialise = async (app) => {
//   let user = {
//     ...MOCK_USERS[0],
//     _id: ObjectId(MOCK_USERS[0]._id),
//   };
//   // const { post } = api(app).as(); // TODO: remove, clean up.

//   const collection = await db.getCollection('tfm-users');

//   const dbUser = await collection.findOne({ username: { $eq: user.username } });
//   if (dbUser) {
//     user = dbUser;
//   } else {
//     await collection.insertOne(user);
//   }

//   const { sessionIdentifier, token } = utils.issueJWT(user);

//   const update = {
//     lastLogin: Date.now(),
//     sessionIdentifier,
//   };
//   await collection.updateOne({ username: { $eq: user.username } }, { $set: update }, {});

//   user.token = token;

//   return user;
// }; TODO: cleanup;

const api = require('./api');
const MOCK_USERS = require('../src/v1/__mocks__/mock-users');

module.exports.initialise = async (app) => {
  const { post } = api(app).as();

  const mockUser = MOCK_USERS[0];

  const { body } = await post({ username: MOCK_USERS[0].username, password: MOCK_USERS[0].password }).to('/v1/login');
  const { token } = body;

  if (token) {
    mockUser.token = token;

    return mockUser;
  }

  await post(mockUser).to('/v1/user');
  const { body: postBody } = await post({ username: MOCK_USERS[0].username, password: MOCK_USERS[0].password }).to('/v1/login');
  const { token: postToken } = postBody;

  mockUser.token = postToken;
  return mockUser;
};
