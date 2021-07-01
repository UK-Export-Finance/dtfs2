const { findUserById } = require('../../v1/controllers/user.controller');
const userReducer = require('../reducers/user');

require('dotenv').config();

const queryUser = async ({ userId }) => {
  const user = await findUserById(userId);

  return userReducer(user);
};

module.exports = queryUser;
