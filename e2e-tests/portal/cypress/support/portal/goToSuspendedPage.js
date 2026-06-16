const checkYourEmailAccessCode = require('../../e2e/pages/login/check-your-email-access-code');
const newAccessCode = require('../../e2e/pages/login/new-access-code');
const relative = require('../../e2e/relativeURL');

/**
 * Navigates through the 2FA resend journey until the account suspension page is reached.
 *
 * @param username - The seeded username used to sign in.
 * @param password - The seeded password used to sign in.
 */
module.exports = ({ username, password }) => {
  // Enter credentials to reach check-your-email-access-code
  cy.enterUsernameAndPassword({ username, password });
  cy.url().should('eq', relative('/login/check-your-email-access-code'));

  // Request new code to reach new-access-code
  checkYourEmailAccessCode.requestCodeLink().click();
  cy.url().should('eq', relative('/login/new-access-code'));

  // Request another code to reach resend-another-access-code
  newAccessCode.requestCodeLink().click();
  cy.url().should('eq', relative('/login/resend-another-access-code'));

  // Navigate directly to request-new-access-code to trigger suspension
  cy.visit('/login/request-new-access-code');
  cy.url().should('eq', relative('/login/temporarily-suspended-access-code'));
};
