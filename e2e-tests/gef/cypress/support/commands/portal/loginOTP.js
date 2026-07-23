const relative = require('../../relativeURL');
const { checkYourEmailAccessCode } = require('../../../../../portal/cypress/e2e/pages');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../e2e-fixtures/portal-users.fixture');

/**
 * Logs in a user to portal using OTP flow
 * Resets the user's OTP status and number of OTPs sent before logging in to ensure the user is in the correct state for testing
 * Overrides the user's OTP with a valid token to allow the test to proceed without needing to retrieve the OTP from email
 * @param {string} username - username to input on login page
 * @param {string} password - password to input on login page
 */
const loginOTP = ({ username, password }) => {
  cy.resetPortalUserStatusAndNumberOfSignInOTPs(username);
  cy.enterUsernameAndPassword({ username, password });

  cy.url().should('eq', relative('/login/check-your-email-access-code'));

  cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username }).then(() => {
    cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);

    cy.clickSubmitButton();
  });
};

export default loginOTP;
