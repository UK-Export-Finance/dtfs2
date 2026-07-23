/**
 * clearSessionCookies
 * Reset session
 */
const clearSessionCookies = () => {
  cy.clearCookie('dtfs-session');
  cy.clearCookie('_csrf');
  cy.getCookies().should('be.empty');
};

module.exports = clearSessionCookies;
