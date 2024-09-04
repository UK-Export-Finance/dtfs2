/**
 * overrideTfmUserSessionId
 * Override a TFM user's session ID/identifier
 * @param {string} username
 * @param {string} sessionIdentifier
 */
const overrideTfmUserSessionId = (username, sessionIdentifier) => {
  cy.task('overrideTfmUserSessionId', { username, sessionIdentifier });
};

module.exports = overrideTfmUserSessionId;
