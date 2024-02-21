const { getTfmRolesFromEntraGroups } = require('../../helpers/entra-group-to-tfm-role');
const authProvider = require('./auth-provider');
const userController = require('../user/user.controller');
const utils = require('../../../utils/crypto.util');
const { updateLastLoginAndResetSignInData } = require('../user/user.controller');

const getExistingTfmUser = async (entraUser) => {
  const claims = entraUser.idTokenClaims;

  const emails = [...claims.verified_primary_email, ...claims.verified_secondary_email];

  return await userController.findByEmails(emails);
};

const createTfmUser = async (entraUser) => {
  const claims = entraUser.idTokenClaims;
  const newUser = {
    azureOid: claims.oid,
    username: claims.email,
    email: claims.email,
    teams: getTfmRolesFromEntraGroups(claims.groups),
    // TODO: move default values to constants
    timezone: 'Europe/London',
    firstName: claims.given_name || 'No name',
    lastName: claims.family_name || 'No surname',
  };

  const createdUser = await userController.createUser(newUser);

  if (createdUser) {
    return createdUser;
  }

  throw new Error("User creation didn't pass validation");
};

const populateTfmUserWithEntraData = (existingTfmUser, entraUser) => {
  const claims = entraUser.idTokenClaims;
  return {
    ...existingTfmUser,
    ...{
      azureOid: claims.oid,
      username: claims.email,
      email: claims.email,
      firstName: claims.given_name || existingTfmUser.firstName,
      lastName: claims.family_name || existingTfmUser.lastName,
      teams: getTfmRolesFromEntraGroups(claims.groups),
    },
  };
}

const processSsoRedirect = async (pkceCodes, origAuthCodeRequest, req ) => {
  let tfmUser;
  const entraUser = await authProvider.handleRedirect(pkceCodes, origAuthCodeRequest, req.body.code, req.body);
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

  updateLastLoginAndResetSignInData(tfmUser, sessionIdentifier, () => {});

  const redirectUrl = authProvider.redirectAfterLogin(req.body.state);
  return { tfmUser, token: tokenObject.token, redirectUrl };
};


module.exports = { processSsoRedirect };