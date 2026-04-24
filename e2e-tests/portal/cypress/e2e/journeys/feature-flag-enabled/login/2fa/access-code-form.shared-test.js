const { submitButton } = require('../../../../partials');

/**
 * Resets the user's OTP state and optionally enters credentials to reach the first 2FA page.
 *
 * @param [opts.login] - When `true` (default), calls `cy.enterUsernameAndPassword` after the reset.
 */
const commonBeforeEach = (user, opts = { login: true }) => {
  const { username } = user;

  cy.getUserByUsername(username);
  cy.resetPortalUserStatusAndNumberOfSignInOTPs(username);
  if (opts.login) {
    cy.enterUsernameAndPassword(user);
  }
};

/**
 * Registers shared `it()` tests for the access code form elements common to all 2FA OTP pages.
 *
 * @param opts.page - Page object for the 2FA page under test.
 * @param opts.expiryText - Full expected expiry information text for this page.
 * @param [opts.requestCodeHref] - When provided, also registers a test for the request-code link.
 */
const sharedAccessCodeFormTests = ({ page, expiryText, requestCodeHref }) => {
  it('should render access code label with text "Enter access code:"', () => {
    cy.assertText(page.sixDigitAccessCodeLabel(), 'Enter access code:');
  });

  it('should render access code input with correct placeholder', () => {
    page.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
  });

  it('should render expiry information text', () => {
    cy.assertText(page.expiryInfo(), expiryText);
  });

  it('should render spam/junk advice', () => {
    cy.assertText(page.spamOrJunk(), 'Please check your spam or junk folders and be aware emails may sometimes take a few minutes to arrive.');
  });

  it('should render suspend information', () => {
    cy.assertText(
      page.suspendInfo(),
      'If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.',
    );
  });

  it('should render submit button text', () => {
    cy.assertText(submitButton(), 'Sign in');
  });

  if (requestCodeHref) {
    it('should render request-code-link pointing to /login/request-new-access-code', () => {
      page.requestCodeLink().should('have.attr', 'href', requestCodeHref);

      cy.assertText(page.requestCodeLink(), 'Request a new code');
    });
  }
};

module.exports = {
  commonBeforeEach,
  sharedAccessCodeFormTests,
};
