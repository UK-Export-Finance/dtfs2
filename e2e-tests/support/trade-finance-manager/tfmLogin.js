const crypto = require('crypto');
const { sign } = require('jws');
const cookieSignature = require('cookie-signature');
const { TFM_URL } = require('../../e2e-fixtures/constants.fixture');

/**
 * issueValidJWT
 * Issue a valid JWT
 * @param {Object} user
 * @param {String} sessionIdentifier
 * @returns {String} JWT
 */
const issueValidJWT = (user, sessionIdentifier) => {
  const {
    _id,
    username,
    teams,
    firstName,
    lastName,
  } = user;

  const payload = {
    sub: _id,
    username,
    teams,
    firstName,
    lastName,
    sessionIdentifier,
  };

  const secret = Buffer.from(Cypress.config('jwtSigningKey'), 'base64').toString('ascii');

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  return sign({
    header,
    payload,
    secret,
    encoding: 'utf8',
  });
};

/**
 * tfmLogin
 * Ensure a user is logged in to TFM.
 * Return JWT token for API use.
 * 1) Create season id
 * 2) Set session id in MondoDB
 * 3) Set session in Redis
 * 4) Set session id in Cookie, if isSessionForAPICall is false (default behaviour)
 * 5) Redirects to TFM root /, if isSessionForAPICall is false (default behaviour)
 * @param {Object} user: User object for login
 * @param {Boolean} isSessionForAPICall: if true no cookie set and no redirect will happen.
 * @returns {Promise<String>} TFM JWT token.
 *
 * @example
 * // Returns "Bearer ..."
 * cy.tfmLogin({user});
 *
 * @example
 * // Returns "Bearer ..."
 * cy.tfmLogin({user, isSessionForAPICall: true}).then((token) => apiCall(token));
 *
 */
const tfmLogin = ({
  user,
  isSessionForAPICall = false,
}) => {
  const { username } = user;

  // TODO: try reuse login session.
  console.info('Mock login::');

  return cy.getTfmUserByUsername(username).then(async (tfmUser) => {
    if (!tfmUser) {
      throw new Error(`No TFM user found with username ${username}`);
    }

    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const userToken = issueValidJWT(tfmUser, sessionIdentifier);
    const maxAge = 60 * 30; // 30 min

    const sessionValue = {
      cookie: {
        originalMaxAge: maxAge * 1000,
        expires: new Date(new Date().getTime() + (maxAge * 1000)).toISOString(),
        secure: false,
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
      },
      user: tfmUser,
      userToken: `Bearer ${userToken}`,
    };

    const cookieOptions = {
      hostOnly: true,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      maxAge,
    };

    const cookieSigningKey = Cypress.config('cookieSigningKey');
    const signedCookieValue = `s:${cookieSignature.sign(sessionIdentifier, cookieSigningKey)}`;

    await cy.overrideTfmUserSessionId(username, sessionIdentifier);
    await cy.overrideRedisUserSession(sessionIdentifier, sessionValue, maxAge);

    if (!isSessionForAPICall) {
      await cy.setCookie('dtfs-session', encodeURIComponent(signedCookieValue), cookieOptions);
      await cy.visit(TFM_URL);
    }

    return `Bearer ${userToken}`;
  });
};

export default tfmLogin;
