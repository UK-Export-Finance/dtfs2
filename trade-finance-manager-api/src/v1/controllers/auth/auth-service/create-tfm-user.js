const mapEntraUserData = require('./map-entra-user-data');
const userController = require('../../user/user.controller');

/**
 * createTfmUser
 * Create a TFM user from Entra user data.
 * @param {Object} entraUser: Entra user data
 * @returns {Object} New TFM user.
 */
const createTfmUser = async (entraUser) => {
  try {
    console.info('TFM auth service - mapping Entra user and creating TFM user');

    const newUser = mapEntraUserData(entraUser);

    const createdUser = await userController.createUser(newUser);

    return createdUser;
  } catch {
    console.error("TFM auth service - Error - User creation didn't pass validation");

    throw new Error("TFM auth service - Error - User creation didn't pass validation");
  }
};

module.exports = createTfmUser;
