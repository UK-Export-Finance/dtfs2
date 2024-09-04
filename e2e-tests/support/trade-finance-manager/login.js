import { issueValidJWT } from '../utils/crypto';

const crypto = require('crypto');
const { TFM_URL } = require('../../e2e-fixtures/constants.fixture');

const LOGIN_SESSION_MAX_AGE = 1800; // 30 min

/**
 * login
 * Ensure a user is logged in to TFM.
 * Return JWT token for API use.
 * 1) Create season id
 * 2) Set session id in MondoDB
 * 3) Set session in Redis
 * 4) Set session id in Cookie, if isSessionForAPICall is false (default behaviour)
 * 5) Redirects to TFM root /, if isSessionForAPICall is false (default behaviour)
 * @param {object} user: User object for login
 * @param {boolean} isSessionForAPICall: if true no cookie set and no redirect will happen.
 * @returns {Promise<string>} TFM JWT token.
 *
 * @example
 * // Returns "Bearer ..."
 * cy.login({user});
 *
 * @example
 * // Returns "Bearer ..."
 * cy.login({user, isSessionForAPICall: true}).then((token) => apiCall(token));
 *
 */
const login = (user, isSessionForAPICall = false) => {
  const { username } = user;

  console.info('Mock login::');

  return cy.getTfmUserByUsername(username).then(async (tfmUser) => {
    if (!tfmUser) {
      throw new Error(`No TFM user found with username ${username}`);
    }

    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const userToken = issueValidJWT(tfmUser, sessionIdentifier, LOGIN_SESSION_MAX_AGE);

    await cy.overrideTfmUserSessionId(username, sessionIdentifier);
    await cy.overrideRedisUserSession(sessionIdentifier, tfmUser, userToken, LOGIN_SESSION_MAX_AGE);

    if (!isSessionForAPICall) {
      await cy.setSessionCookie(sessionIdentifier, LOGIN_SESSION_MAX_AGE);
      await cy.visit(TFM_URL);
    }

    return `Bearer ${userToken}`;
  });
};

export default login;
