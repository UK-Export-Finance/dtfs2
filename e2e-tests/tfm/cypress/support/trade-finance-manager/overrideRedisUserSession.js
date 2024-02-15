module.exports = (sessionIdentifier, value, maxAge) => {
  cy.task('overrideRedisUserSession', { sessionIdentifier, value, maxAge });
};
