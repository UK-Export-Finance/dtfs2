const userController = require('../../user/user.controller');

/**
 * getExistingTfmUser
 * Get an existing TFM user with a matching Entra use email(s)
 * Note: an Entra user could have just a primary email, no secondary email.
 * @param {Object} entraUser: Entra user data
 * @returns {Object}
 */
const getExistingTfmUser = async (entraUser) => {
  try {
    console.info('TFM auth service - Getting existing TFM user');

    const claims = entraUser.idTokenClaims;

    let emails = claims.verified_primary_email;

    if (claims.verified_secondary_email) {
      emails = [...emails, ...claims.verified_secondary_email];
    }

    const user = await userController.findByEmails(emails);

    return user;
  } catch (error) {
    console.error('TFM auth service - Error - Getting existing TFM user %O', error);

    throw new Error('TFM auth service - Error - Getting existing TFM user %O', error);
  }
};

module.exports = getExistingTfmUser;
