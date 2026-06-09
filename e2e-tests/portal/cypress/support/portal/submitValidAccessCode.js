const { BANK1_MAKER1 } = require('../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../e2e-fixtures/portal-users.fixture');

/**
 * Overrides the OTP with a valid token, enters the code into the current page and submits it.
 *
 * @param page - The 2FA page object containing the access code input.
 */
module.exports = (page) => {
  cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
    cy.keyboardInput(page.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
    cy.clickSubmitButton();
  });
};
