/**
 * overrideTfmUserSessionId
 * Override a TFM user's session ID/identifier
 * @param {String} username
 * @param {String} sessionIdentifier
 */
const overrideTfmUserSessionId = (username, sessionIdentifier) => {
  cy.task('overrideTfmUserSessionId', { username, sessionIdentifier });
};

module.exports = overrideTfmUserSessionId;
