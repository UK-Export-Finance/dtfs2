const crypto = require('crypto');
const jws = require('jws');
const cookieSignature = require('cookie-signature');
const relative = require('../../tfm/cypress/e2e/relativeURL');
const { TFM_URL } = require('../../e2e-fixtures/constants.fixture');

const issueValid2faJWT = (user, sessionIdentifier) => {
  const { _id } = user;
  const payload = {
    sub: _id,
    username: user.username,
    teams: user.teams,
    firstName: user.firstName,
    lastName: user.lastName,
    sessionIdentifier,
  };
  const secret = Buffer.from(Cypress.config('jwtSigningKey'), 'base64').toString('ascii');

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  return jws.sign({
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
 * 4) Set session id in Cookie
 * @param {Object} user: User object for login.
 * @param {String} url: URL to navigate to after login. Defaults to TFM_URL
 * @param {Boolean} createCookie: This can be skipped if we just need a JWT for the API.
 * @returns {Promise<String>} TFM JWT token.
 *
 * @example
 * // Returns { status: 200, data: { name: 'United States', population: 331002651, capital: 'Washington, D.C.' } }
 * getCountry('US');
 *
 * @example
 * // Returns { status: 404 }
 * getCountry('ZZ');
 */
const tfmLogin = ({
  user,
  url = TFM_URL,
  createCookie = true,
}) => {
  const { username } = user;

  let fullUrl;

  if (url && url.indexOf('http') === 0) {
    fullUrl = url;
  } else if (url === null) {
    fullUrl = null;
  } else {
    fullUrl = relative(url);
  }
  // TODO: try reuse login session.
  console.info('Mock login::');

  return cy.getTfmUserByUsername(username).then(async (tfmUser) => {
    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const userToken = issueValid2faJWT(tfmUser, sessionIdentifier);
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
    if (createCookie) {
      // Skipping cookie allows background login for API calls
      await cy.setCookie('dtfs-session', encodeURIComponent(signedCookieValue), cookieOptions);
    }
    if (fullUrl) {
      await cy.visit(fullUrl);
    }
    return `Bearer ${userToken}`;
  });
};

export default tfmLogin;
