/**
 * overrideRedisUserSession
 * Override a redis user session.
 * @param {String} sessionIdentifier: UKEF session identifier
 * @param {Object} tfmUser: TFM user
 * @param {String} userToken: TFM JWT token
 * @param {Number} maxAge: Session age
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
