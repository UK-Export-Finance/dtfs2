const checkYourEmailAccessCode = require('../../e2e/pages/login/check-your-email-access-code');
const newAccessCode = require('../../e2e/pages/login/new-access-code');
const resendAnotherAccessCode = require('../../e2e/pages/login/resend-another-access-code');

module.exports = (username) =>
  cy.getUserByUsername(username).then((user) => {
    // Enter credentials to reach check-your-email-access-code
    cy.enterUsernameAndPassword(user);
    cy.url().should('contain', '/login/check-your-email-access-code');

    // Request new code to reach new-access-code
    checkYourEmailAccessCode.requestCodeLink().click();
    cy.url().should('contain', '/login/new-access-code');

    // Request another code to reach resend-another-access-code
    newAccessCode.requestCodeLink().click();
    cy.url().should('contain', '/login/resend-another-access-code');

    // Request final code to reach temporarily-suspended-access-code
    resendAnotherAccessCode.requestCodeLink().click();
    cy.url().should('contain', '/login/temporarily-suspended-access-code');
  });
