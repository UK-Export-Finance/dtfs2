const authProvider = require('../auth-provider');
const tfmUser = require('./get-or-create-tfm-user');
const { issueJwtAndUpdateUser } = require('./issue-jwt-and-update-user');

/**
 * @typedef {import('src/types/db-models/tfm-users').TfmUser, token: string,redirectUrl: string} ProcessSsoRedirectResponse
 */

/**
 * processSsoRedirect
 * Process SSO redirect.
 * 1) Get Entra user.
 * 2) Get TFM user. If no user exists, create a new one.
 * 3) Populate Entra and TFM user data.
 * 4) Issue a JWT and update TFM user data.
 * 7) Get redirect URL
 * 8) Return user data, token and redirect URL.
 * @param {object} pkceCodes PKCE Codes object
 * @param {object} authCodeRequest Auth code request
 * @param {string} code authZ code
 * @param {import('src/types/auth/msal-state-unparsed').MsalStateUnparsed} state MSAL state, containing a base64 encoded JSON object of state passed to Microsoft prior to redirect
 * @returns {Promise<ProcessSsoRedirectResponse | {} | unknown>} TFM user, token and redirect URL or empty object or error
 */
const processSsoRedirect = async ({ pkceCodes, authCodeRequest, code, state }) => {
  try {
    if (!pkceCodes || !authCodeRequest || !code || !state) {
      return {};
    }

    console.info('TFM auth service - processing SSO redirect');

    const entraUser = await authProvider.handleRedirect(pkceCodes, authCodeRequest, code);

    const user = await tfmUser.getOrCreateTfmUserForEntraUser(entraUser);

    const token = await issueJwtAndUpdateUser(user);

    const redirectUrl = authProvider.getLoginRedirectUrlFromState(state);

    return { tfmUser: user, token, redirectUrl };
  } catch (error) {
    console.error('TFM auth service - Error processing SSO redirect: %s', error);

    return error;
  }
};

module.exports = {
  processSsoRedirect,
};
