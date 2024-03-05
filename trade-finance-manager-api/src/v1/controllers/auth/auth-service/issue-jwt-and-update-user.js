const utils = require('../../../../utils/crypto.util');
const { updateLastLoginAndResetSignInData } = require('../../user/user.controller');

/**
 * execute
 * Issue a JWT and update the user.
 * @param {Object} tfmUser: TFM user
 * @returns {String} JWT token
 */
const execute = async (tfmUser) => {
  try {
    console.info('TFM auth service - issuing JWT and updating user');

    const { sessionIdentifier, ...tokenObject } = utils.issueJWT(tfmUser);

    await updateLastLoginAndResetSignInData(tfmUser, sessionIdentifier, () => { });

    const { token } = tokenObject;

    return token;
  } catch (error) {
    console.error('TFM auth service - Error issuing JWT and updating user: %s', error);

    throw new Error('TFM auth service - Error issuing JWT and updating user: %s', error);
  }
};

module.exports = { execute };
