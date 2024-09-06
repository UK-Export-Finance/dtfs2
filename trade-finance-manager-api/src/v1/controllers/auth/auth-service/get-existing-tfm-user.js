const userController = require('../../user/user.controller');

/**
 * get
 * Get an existing TFM user with a matching Entra use email(s)
 * Note: an Entra user could have just a primary email, no secondary email.
 * @param {import('src/types/auth/azure-user-info-response-account').AzureUserInfoResponseAccount} entraUser Entra user data
 * @returns {Promise<import('src/types/auth/get-user-response').GetUserResponse | {}>}
 */
const get = async (entraUser) => {
  if (!entraUser?.idTokenClaims) {
    return {};
  }

  try {
    console.info('TFM auth service - Getting existing TFM user');

    /** @constant {import('src/types/auth/azure-user-info-response-account').AzureIdTokenClaims} Entra claims */
    const claims = entraUser.idTokenClaims;

    // verified_primary_email is always array.
    let emails = claims.verified_primary_email;
    // verified_secondary_email is always array.
    if (claims.verified_secondary_email) {
      emails = [...emails, ...claims.verified_secondary_email];
    }

    const getUserResponse = await userController.findByEmails(emails);

    return getUserResponse;
  } catch (error) {
    console.error('TFM auth service - Error - Getting existing TFM user %O', error);

    throw new Error('TFM auth service - Error - Getting existing TFM user %O', error);
  }
};

module.exports = { get };
