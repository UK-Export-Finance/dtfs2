const checkYourEmailAccessCode = require('../../e2e/pages/login/check-your-email-access-code');
const newAccessCode = require('../../e2e/pages/login/new-access-code');
const resendAnotherAccessCode = require('../../e2e/pages/login/resend-another-access-code');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../e2e-fixtures/portal-users.fixture');

/**
 * Navigate to the desired access-code page via UI and submit an expired token.
 *
 * Accepts a fixture user (or any object with the seeded plaintext `username` and `password`),
 * not a DB user document — `cy.enterUsernameAndPassword` requires the plaintext password,
 * which the persisted user record does not expose.
 *
 * @param params.username - The seeded plaintext username used to log in.
 * @param params.password - The seeded plaintext password used to log in.
 * @param [params.count=0] - Number of "request a new code" UI clicks to perform after login
 *                           (0 -> check-your-email, 1 -> new-access-code, 2 -> resend-another-access-code).
 */
module.exports = ({ username, password, count = 0 }) => {
  /**
   * Fail fast if `count` is out of range. Only 0, 1 and 2 map to a real 2FA page
   * (check-your-email, new-access-code, resend-another-access-code respectively);
   * any other value would silently fall through to the check-your-email selector.
   */
  if (![0, 1, 2].includes(count)) {
    throw new Error(`submitExpiredAccessCode: 'count' must be 0, 1 or 2 (received ${count}).`);
  }

  // Enter credentials to start the 2FA journey
  cy.enterUsernameAndPassword({ username, password });

  // Ensure we're on the check-your-email page, then click the request link 'count' times
  cy.url().should('contain', '/login/check-your-email-access-code');

  // each click advances to next page: check -> new -> resend-another
  for (let i = 0; i < count; i += 1) {
    if (i === 0) {
      checkYourEmailAccessCode.requestCodeLink().click();
      cy.url().should('contain', '/login/new-access-code');
    } else if (i === 1) {
      newAccessCode.requestCodeLink().click();
      cy.url().should('contain', '/login/resend-another-access-code');
    }
  }

  // Replace the valid token with an expired one, then submit the code
  cy.overridePortalUserSignInOTPWithExpiredToken({ username });

  // The page is determined by how many request-code clicks we just performed:
  // 0 -> check-your-email, 1 -> new-access-code, 2 -> resend-another-access-code.
  let input;
  if (count === 1) {
    input = newAccessCode.accessCodeInput();
  } else if (count === 2) {
    input = resendAnotherAccessCode.accessCodeInput();
  } else {
    input = checkYourEmailAccessCode.accessCodeInput();
  }

  cy.keyboardInput(input, PORTAL_2FA_ACCESS_CODE);
  cy.clickSubmitButton();
};
