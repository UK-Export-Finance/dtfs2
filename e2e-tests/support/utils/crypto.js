const { sign } = require('jws');

/**
 * issueValidJWT
 * Issue a valid JWT
 * @param {object} user
 * @param {string} sessionIdentifier
 * @returns {string} JWT
 */
const issueValidJWT = (user, sessionIdentifier, maxAge) => {
  const { _id, username, teams, firstName, lastName } = user;

  const payload = {
    sub: _id,
    username,
    teams,
    firstName,
    lastName,
    sessionIdentifier,
    exp: Date.now() + maxAge,
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

export { issueValidJWT };
