const crypto = require('crypto');
const jws = require('jws');
const cookieSignature = require('cookie-signature');
const relative = require('../../e2e/relativeURL');

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

export default (opts) => {
  const { username } = opts;
  // TODO: try reuse login session.
  console.info('HEY HEY WE do login again');

  return cy.getTfmUserByUsername(username).then(async (user) => {
    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const userToken = issueValid2faJWT(user, sessionIdentifier);
    await cy.overrideTfmUserSessionId(username, sessionIdentifier);
    // const maxAge = 604800000;
    const maxAge = 60 * 30 * 1000; // 30 min

    const sessionValue = {
      cookie: {
        originalMaxAge: maxAge,
        expires: new Date(new Date().getTime() + maxAge).toISOString(),
        secure: false,
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
      },
      user,
      userToken: `Bearer ${userToken}`,
    };
    await cy.overrideRedisUserSession(sessionIdentifier, sessionValue, maxAge);

    const cookieOptions = {
      hostOnly: true,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      maxAge,
    };
    const cookieSigningKey = Cypress.config('cookieSigningKey');
    const signedCookieValue = `s:${cookieSignature.sign(sessionIdentifier, cookieSigningKey)}`;
    await cy.setCookie('dtfs-session', encodeURIComponent(signedCookieValue), cookieOptions);
    await cy.visit(relative('/'));
    return `Bearer ${userToken}`;
  });
};
