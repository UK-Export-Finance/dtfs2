const authProvider = require('../auth-provider');
const mapEntraUserData = require('./map-entra-user-data');
const userController = require('../../user/user.controller');
const utils = require('../../../../utils/crypto.util');
const { updateLastLoginAndResetSignInData } = require('../../user/user.controller');

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

/**
 * populateTfmUserWithEntraData
 * Populate TFM user data with Entra user data.
 * @param {Object} tfmUser: Existing TFM user data
 * @param {Object} entraUser: Entra user data
 * @returns
 */
const populateTfmUserWithEntraData = (tfmUser, entraUser) => ({
  ...tfmUser,
  ...mapEntraUserData(entraUser, tfmUser),
});

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
  getExistingTfmUser,
  mapEntraUserData,
  createTfmUser,
  populateTfmUserWithEntraData,
  processSsoRedirect,
};
