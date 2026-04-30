const checkYourEmailAccessCode = require('../../e2e/pages/login/check-your-email-access-code');
const newAccessCode = require('../../e2e/pages/login/new-access-code');

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

    // Navigate directly to request-new-access-code to trigger suspension
    cy.visit('/login/request-new-access-code');
    cy.url().should('contain', '/login/temporarily-suspended-access-code');
  });
