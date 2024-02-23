/**
 * overrideRedisUserSession
 * Override a redis user session.
 * @param {String} sessionIdentifier: Redis session identifier
 * @param {String} value: New session identifier value
 * @param {String} maxAge: Session age
 */
const overrideRedisUserSession = (sessionIdentifier, value, maxAge) => {
  cy.task('overrideRedisUserSession', { sessionIdentifier, value, maxAge });
};

module.exports = overrideRedisUserSession;
