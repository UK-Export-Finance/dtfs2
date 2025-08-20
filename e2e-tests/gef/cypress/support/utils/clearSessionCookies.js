/**
 * clearSessionCookies
 * Reset session by clearing the dtfs session cookie and csrf cookie
 * Ensures cookies array is empty
 */
export const clearSessionCookies = () => {
  cy.clearCookie('dtfs-session');
  cy.clearCookie('_csrf');
  cy.getCookies().should('be.empty');
};
