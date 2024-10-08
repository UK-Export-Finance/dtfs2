import 'cypress-v10-preserve-cookie';

/**
 * Since cookies are cleared before individual tests execution.
 * Preserving the cookie, eliminates repeated logins.
 * Thus reduces execution time.
 */
export default () =>
  cy.preserveCookieOnce(
    'dtfs-session', // Session cookie
    '_csrf', // CSRF cookie
  );
