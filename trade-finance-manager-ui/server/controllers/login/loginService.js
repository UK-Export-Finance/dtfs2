const { getTfmRolesFromEntraGroups } = require('../../helpers/entra-group-to-tfm-role');
const api = require('../../api');
const authProvider = require('../../middleware/auth-provider');

const getExistingTfmUser = async (entraUser) => {
  const claims = entraUser.idTokenClaims;
  console.info('Entra response claims -------------------------------------------', claims);

  const emails = [...claims.verified_primary_email, ...claims.verified_secondary_email];

  const userResponse = await api.getUserByEmail(emails);

  if (userResponse?.username) {
    return userResponse;
  }
  if (userResponse?.status === 404) {
    return 404;
  }
  throw new Error('Unexpected get user response %s', userResponse);
};

const createTfmUser = async (entraUser) => {
  const claims = entraUser.idTokenClaims;
  const newUser = {
    azureOid: claims.oid,
    username: claims.email,
    email: claims.email,
    teams: getTfmRolesFromEntraGroups(claims.groups),
    timezone: 'Europe/London',
    firstName: claims.given_name || 'No name',
    lastName: claims.family_name || 'No surname',
  };

  const createResponse = await api.createUser(newUser);

  if (createResponse?.user) {
    return createResponse.user;
  }

  throw new Error('Unexpected create user response %s', createResponse);
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

const acceptExternalSsoPost = (req, res) => {
  const { code, client_info: clientInfo, state, session_state: sessionState } = req.body;

  // TODO: validate referrer, it should be login.microsoft.com
  // TODO: !!! referrer is not available in localhost because of header "Referrer-Policy": "no-referrer-when-downgrade".
  // TODO: validate incoming variables, they should be alphanumeric/safe
  return res.render('sso/accept-external-sso-post.njk', {
    code,
    clientInfo,
    state,
    sessionState
  });
};

const processInternalSsoPost = async (req, res, next) => {
  // if (!req.session?.pkceCodes) {
  //   console.error('SSO login session details are missing. Start login from beginning.');
  //   return res.redirect('/home');
  // }
  const entraUser = await authProvider.handleRedirect(req, res, next);
  if (!entraUser?.idTokenClaims) {
    console.error('Entra user details are missing. Start login from beginning. Entra user %O', entraUser);
    // Delete session and start login from beginning.
    return req.session.destroy(() => {
      res.redirect('/home');
    });
  }
  const existingTfmUser = await getExistingTfmUser(entraUser);
  if (existingTfmUser.username) {
    // TODO: update user roles/teams in DB.
    req.session.user = populateTfmUserWithEntraData(existingTfmUser, entraUser);
  }
  if (existingTfmUser === 404) {
    const newTfmUser = await createTfmUser(entraUser);
    req.session.user = newTfmUser;
  }
  // TODO: token might have roles/teams different from Entra, do TODO above^.
  // TODO: should we use Entra JWT token instead of our token?
  const tokenResponse = await api.getUserToken(req.session.user);
  req.session.userToken = tokenResponse.token;

  // Unset data used for SSO validation.
  delete req.session.pkceCodes;
  delete req.session.authCodeUrlRequest;
  delete req.session.authCodeRequest;

  res.cookie('ssoRedirectNo', 0, { maxAge: 3600000, httpOnly: true });
  return authProvider.redirectAfterLogin(req.body.state, res);
};

module.exports = { getExistingTfmUser, createTfmUser, populateTfmUserWithEntraData, acceptExternalSsoPost, processInternalSsoPost };