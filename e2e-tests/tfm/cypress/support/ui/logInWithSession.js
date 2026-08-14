/**
 * Logs a TFM user in and caches their authenticated browser session.
 *
 * Sessions are keyed by username so tests can switch users without sharing
 * authentication state. The session cookie assertions ensure login has
 * completed before caching and that a restored session is still valid.
 *
 * @param {{ username: string, password: string }} user TFM user credentials.
 * @returns {Cypress.Chainable<null>} The Cypress session command.
 */
export default (user) =>
  cy.session(
    user.username,
    () => {
      cy.login(user);
      cy.getCookie('dtfs-session').should('exist');
    },
    {
      validate: () => cy.getCookie('dtfs-session').should('exist'),
    },
  );
