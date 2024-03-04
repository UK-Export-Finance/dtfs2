const authProvider = require('../auth-provider');
const getOrCreateTfmUser = require('./get-or-create-tfm-user');
const issueJwtAndUpdateUser = require('./issue-jwt-and-update-user');

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
 * @returns {Object} TFM user, token and redirect URL.
 */
const processSsoRedirect = async ({ pkceCodes, authCodeRequest, code, state }) => {
  try {
    console.info('TFM auth service - processing SSO redirect');

    const entraUser = await authProvider.handleRedirect(pkceCodes, authCodeRequest, code);

    const tfmUser = await getOrCreateTfmUser(entraUser);

    const token = await issueJwtAndUpdateUser(tfmUser);

    const redirectUrl = authProvider.loginRedirectUrl(state);

    return { tfmUser, token, redirectUrl };
  } catch (error) {
    console.error('TFM auth service - Error processing SSO redirect: %s', error);

    throw new Error('TFM auth service - Error processing SSO redirect: %s', error);
  }
};

module.exports = {
  processSsoRedirect,
};
