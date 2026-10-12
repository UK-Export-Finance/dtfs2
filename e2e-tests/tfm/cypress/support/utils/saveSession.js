const savedCookies = new Map();

const cookiesToPreserve = [
  'dtfs-session', // Session cookie
  '_csrf', // CSRF cookie
];

/**
 * Since cookies are cleared before individual tests execution.
 * Preserving the cookie, eliminates repeated logins.
 * Thus reduces execution time.
 */
export default () => {
  cookiesToPreserve.forEach((name) => {
    cy.getCookie(name, { log: false })
      .should(Cypress._.noop)
      .then((cookie) => {
        if (cookie) {
          savedCookies.set(name, cookie);
          return;
        }

        const savedCookie = savedCookies.get(name);

        if (savedCookie) {
          cy.setCookie(name, savedCookie.value, { log: false });
        }
      });
  });
};
