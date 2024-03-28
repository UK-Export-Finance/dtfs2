const authProvider = require('../auth-provider');
const tfmUser = require('./get-or-create-tfm-user');
const { issueJwtAndUpdateUser } = require('./issue-jwt-and-update-user');

/**
 * processSsoRedirect
 * Process SSO redirect.
 * 1) Get Entra user.
 * 2) Get TFM user. If no user exists, create a new one.
 * 3) Populate Entra and TFM user data.
 * 4) Issue a JWT and update TFM user data.
 * 7) Get redirect URL
 * 8) Return user data, token and redirect URL.
 * @param {Object} pkceCodes: PKCE Codes object
 * @param {Object} authCodeRequest: Auth code request
 * @param {String} code: authZ code
 * @param {String} state: MSAL state guid
 * @returns {Promise<Object>} TFM user, token and redirect URL.
 */
const processSsoRedirect = async ({ pkceCodes, authCodeRequest, code, state }) => {
  try {
    if (pkceCodes && authCodeRequest && code && state) {
      console.info('TFM auth service - processing SSO redirect');

      const entraUser = await authProvider.handleRedirect(pkceCodes, authCodeRequest, code);

      const user = await tfmUser.getOrCreate(entraUser);

      const token = await issueJwtAndUpdateUser(user);

      const redirectUrl = authProvider.loginRedirectUrl(state);

      return { tfmUser: user, token, redirectUrl };
    }

    return {};
  } catch (error) {
    console.error('TFM auth service - Error processing SSO redirect: %s', error);

    return error;
  }
};

module.exports = {
  processSsoRedirect,
};
