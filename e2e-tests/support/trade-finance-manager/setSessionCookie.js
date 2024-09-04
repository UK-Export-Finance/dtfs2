const cookieSignature = require('cookie-signature');

/**
 * setTfmSessionCookie
 * Sign sessionId and set as session cookie value.
 * @param {string} sessionIdentifier ExpressJs session id
 * @param {number} maxAge session age
 */
const setSessionCookie = (sessionIdentifier, maxAge) => {
  const cookieOptions = {
    hostOnly: true,
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    maxAge,
  };

  const cookieSigningKey = Cypress.config('cookieSigningKey');
  const signedCookieValue = `s:${cookieSignature.sign(sessionIdentifier, cookieSigningKey)}`;

  cy.setCookie('dtfs-session', encodeURIComponent(signedCookieValue), cookieOptions);
};

module.exports = setSessionCookie;
