const getExistingTfmUser = require('./get-existing-tfm-user');
const createTfmUser = require('./create-tfm-user');
const populateTfmUserWithEntraData = require('./populate-tfm-user-with-entra-data');
const authProvider = require('../auth-provider');
const utils = require('../../../../utils/crypto.util');
const { updateLastLoginAndResetSignInData } = require('../../user/user.controller');

/**
 * processSsoRedirect
 * Process SSO redirect.
 * 1) Get Entra user.
 * 2) Get TFM user. If no user exists, create a new one.
 * 3) Populate Entra and TFM user data.
 * 4) Issue a JWT.
 * 5) Update TFM user data.
 * 6) Get redirect URL
 * 7) Return user data, token and redirect URL.
 * @param {Object} pkceCodes: PKCE Codes object
 * @param {Object} authCodeRequest: Auth code request
 * @param {String} code: authZ code
 * @param {String} state: MSAL state guid
 * @returns {Object} TFM user, token and redirect URL.
 */
const processSsoRedirect = async ({ pkceCodes, authCodeRequest, code, state }) => {
  console.info('TFM auth service - processing SSO redirect');

  let entraUser;
  let mappedTfmUser;

  try {
    entraUser = await authProvider.handleRedirect(pkceCodes, authCodeRequest, code);

    if (!entraUser?.idTokenClaims) {
      throw new Error('TFM auth service - processing SSO redirect - Entra user details are missing: %O', entraUser);
    }

    const existingTfmUser = await getExistingTfmUser(entraUser);

    mappedTfmUser = populateTfmUserWithEntraData(existingTfmUser, entraUser);

    if (existingTfmUser.notFound) {
      console.info('TFM auth service - no existing TFM user found. Creating a new TFM user.');

      mappedTfmUser = await createTfmUser(entraUser);
    }
    else if (existingTfmUser.found && existingTfmUser.canProceed === false) {
      console.info("TFM auth service - found an existing TFM user, but can't proceed");
      throw new Error("TFM auth service - found an existing TFM user, but can't proceed");
    }
    else if (existingTfmUser.found && existingTfmUser.canProceed) {
      console.info('TFM auth service - found an existing TFM user. Updating the user.');
      // TODO: add updating of user teams, first name and last name. Maybe merge with last login and session update.

    }

    const { sessionIdentifier, ...tokenObject } = utils.issueJWT(mappedTfmUser);

    await updateLastLoginAndResetSignInData(mappedTfmUser, sessionIdentifier, () => { });

    const redirectUrl = authProvider.loginRedirectUrl(state);

    return { tfmUser: mappedTfmUser, token: tokenObject.token, redirectUrl };
  } catch (error) {
    console.error('TFM auth service - Error processing SSO redirect: %s', error);

    throw new Error('TFM auth service - Error processing SSO redirect: %s', error);
  }
};

module.exports = {
  processSsoRedirect,
};
