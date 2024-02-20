module.exports = (username, sessionIdentifier) => {
  cy.task('overrideTfmUserSessionId', { username, sessionIdentifier });
};
