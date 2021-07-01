const { findUserById } = require('../../v1/controllers/user.controller');
const userReducer = require('../reducers/user');

require('dotenv').config();

const queryUser = async ({ userId }) => {
  const user = await findUserById(userId);

  console.log('------ queryUser - user \n', user);
  return userReducer(user);
};

module.exports = queryUser;
