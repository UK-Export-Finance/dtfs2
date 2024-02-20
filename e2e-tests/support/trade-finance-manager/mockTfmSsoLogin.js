const crypto = require('crypto');
const jws = require('jws');
const cookieSignature = require('cookie-signature');
const relative = require('../../tfm/cypress/e2e/relativeURL');

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
 * Ensure user is logged in TFM and return JWT token for API use.
 *
 * - Create season id
 * - Set session id in MondoDB
 * - Set session in Redis
 * - Set session id in Cookie
 *
 * @param {Object} loginUser - User object to login.
 * @param {string} url - usually after login you want to visit home page, pass null to skip for API call.
 * @param {boolean} createCookie - this can be skip if we just need JWT for API call.
 * @returns {Promise<String>} - TFM Jwt token.
 *
 * @example
 * // Returns { status: 200, data: { name: 'United States', population: 331002651, capital: 'Washington, D.C.' } }
 * getCountry('US');
 *
 * @example
 * // Returns { status: 404 }
 * getCountry('ZZ');
 */
export default (loginUser, url = '/', createCookie = true) => {
  const { username } = loginUser;
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

  return cy.getTfmUserByUsername(username).then(async (user) => {
    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const userToken = issueValid2faJWT(user, sessionIdentifier);
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
      user,
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
