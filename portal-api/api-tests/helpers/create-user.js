const app = require('../../server/createApp');
const { as } = require('../api')(app);

/**
 * Creates a user to the users collection.
 * @param {string} userToCreate - User object to create
 * @param {string} adminUser - Admin user to perform the action
 * @returns {Promise<object>} - Response from the create user request
 */
export const createUser = async (userToCreate, adminUser) => {
  const userCreate = { ...userToCreate };
  delete userCreate?.password;
  return as(adminUser).post(userCreate).to('/v1/users');
};
