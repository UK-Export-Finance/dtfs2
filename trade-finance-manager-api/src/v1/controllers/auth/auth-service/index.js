const authProvider = require('../auth-provider');
const mapEntraUserData = require('./map-entra-user-data');
const userController = require('../../user/user.controller');
const utils = require('../../../../utils/crypto.util');
const { updateLastLoginAndResetSignInData } = require('../../user/user.controller');

/**
 * getExistingTfmUser
 * Get an existing TFM user with a matching Entra use email(s)
 * @param {Object} entraUser: Entra user data
 * @returns {Object}
 */
const getExistingTfmUser = async (entraUser) => {
  const claims = entraUser.idTokenClaims;

  const emails = [...claims.verified_primary_email, ...claims.verified_secondary_email];

  return await userController.findByEmails(emails);
};

/**
 * createTfmUser
 * Create a TFM user from Entra user data.
 * @param {Object} entraUser: Entra user data
 * @returns {Object} New TFM user.
 */
const createTfmUser = async (entraUser) => {
  const newUser = mapEntraUserData(entraUser);

  const createdUser = await userController.createUser(newUser);

  if (createdUser) {
    return createdUser;
  }

  throw new Error("User creation didn't pass validation");
};

/**
 * populateTfmUserWithEntraData
 * Populate TFM user data with Entra user data.
 * @param {Object} existingTfmUser: Existing TFM user data
 * @param {Object} entraUser: Entra user data
 * @returns 
 */
const populateTfmUserWithEntraData = (existingTfmUser, entraUser) => ({
  ...existingTfmUser,
  ...mapEntraUserData(entraUser, existingTfmUser),
});

/**
 * processSsoRedirect
 * Process SSO redirect.
 * 1) Get Entra user.
 * 2) Get and populate Entra user data with TFM user data.
 * 3) Issue a JWT.
 * 4) Update user sign in data.
 * 5) Get redirect URL
 * 6) Return user data, token and redirect URL.
 * @param {Object} pkceCode: PKCE Code object
 * @param {Object} origAuthCodeRequest: Original auth code request
 * @param {Object} req: Request object
 * @returns {Object} TFM user, token and redirect URL.
 */

// TODO: consume values from req.body instead of passing req.
const processSsoRedirect = async (pkceCode, origAuthCodeRequest, req) => {
  let tfmUser;

  const entraUser = await authProvider.handleRedirect(pkceCode, origAuthCodeRequest, req.body.code, req.body);

  if (!entraUser?.idTokenClaims) {
    throw new Error('Entra user details are missing: %O', entraUser);
  }

  try {
    const existingTfmUser = await getExistingTfmUser(entraUser);
    // TODO: update user in DB
    tfmUser = populateTfmUserWithEntraData(existingTfmUser, entraUser);
  } catch (err) {
    // TODO: couldn't get instanceof working
    if (err.name === 'UserNotFoundError') {
      tfmUser = await createTfmUser(entraUser);
    } else {
      throw err;
    }
  }

  const { sessionIdentifier, ...tokenObject } = utils.issueJWT(tfmUser);

  updateLastLoginAndResetSignInData(tfmUser, sessionIdentifier, () => { });

  const redirectUrl = authProvider.redirectAfterLogin(req.body.state);

  return { tfmUser, token: tokenObject.token, redirectUrl };
};

module.exports = {
  getExistingTfmUser,
  mapEntraUserData,
  createTfmUser,
  populateTfmUserWithEntraData,
  processSsoRedirect,
};
