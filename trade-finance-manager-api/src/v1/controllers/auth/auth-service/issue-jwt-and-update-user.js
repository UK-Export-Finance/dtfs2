const utils = require('../../../../utils/crypto.util');
const userController = require('../../user/user.controller');

/**
 * execute
 * Issue a JWT and update the user.
 * @param {import('src/types/db-models/tfm-users').TfmUser} tfmUser TFM user
 * @returns {Promise<string>} JWT token
 */
const issueJwtAndUpdateUser = async (tfmUser) => {
  try {
    console.info('TFM auth service - issuing JWT and updating user');

    const { sessionIdentifier, token } = utils.issueJWT(tfmUser);

    await userController.updateLastLoginAndResetSignInData(tfmUser, sessionIdentifier);

    return token;
  } catch (error) {
    console.error('TFM auth service - Error issuing JWT and updating user: %s', error);

    throw new Error('TFM auth service - Error issuing JWT and updating user: %s', error);
  }
};

module.exports = { issueJwtAndUpdateUser };
