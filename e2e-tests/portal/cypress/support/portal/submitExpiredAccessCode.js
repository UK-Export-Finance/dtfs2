const checkYourEmailAccessCode = require('../../e2e/pages/login/check-your-email-access-code');
const newAccessCode = require('../../e2e/pages/login/new-access-code');
const resendAnotherAccessCode = require('../../e2e/pages/login/resend-another-access-code');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../e2e-fixtures/portal-users.fixture');

/**
 * Navigate to the desired access-code page via UI and submit an expired token.
 * @param {{username: string, count?: number}} params - username and number of resends to perform before submitting expired code.
 */
module.exports = ({ username, count = 0 }) =>
  cy.getUserByUsername(username).then((user) => {
    // Enter credentials to start the 2FA journey
    cy.enterUsernameAndPassword(user);

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

    // choose the correct page input to fill
    const currentUrl = Cypress.$(window).location?.pathname || '';

    // Fallback: prefer checkYourEmail input if unable to detect
    let input;
    if (currentUrl.includes('new-access-code') || count === 1) {
      input = newAccessCode.accessCodeInput();
    } else if (currentUrl.includes('resend-another-access-code') || count === 2) {
      input = resendAnotherAccessCode.accessCodeInput();
    } else {
      input = checkYourEmailAccessCode.accessCodeInput();
    }

    cy.keyboardInput(input, PORTAL_2FA_ACCESS_CODE);
    cy.clickSubmitButton();
  });
