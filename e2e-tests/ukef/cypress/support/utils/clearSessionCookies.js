/**
 * clearSessionCookies
 * Reset session
 */
export const clearSessionCookies = () => {
  cy.clearCookie('dtfs-session');
  cy.clearCookie('_csrf');
  cy.getCookies().should('be.empty');
};
