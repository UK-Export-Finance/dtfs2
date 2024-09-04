/**
 * overrideRedisUserSession
 * Override a redis user session.
 * @param {string} sessionIdentifier UKEF session identifier
 * @param {object} tfmUser TFM user
 * @param {string} userToken TFM JWT token
 * @param {number} maxAge Session age
 */
const overrideRedisUserSession = (sessionIdentifier, tfmUser, userToken, maxAge) => {
  cy.task('overrideRedisUserSession', {
    sessionIdentifier,
    tfmUser,
    userToken,
    maxAge,
  });
};

module.exports = overrideRedisUserSession;
