const { errorSummary } = require('../../../../partials');

/**
 * Asserts common elements present on all 2FA OTP pages with exact text content validation.
 * Tests actual text strings rather than just element existence to ensure content accuracy.
 *
 * @param {object} opts
 * @param {object} opts.page - Page object exposing getter functions for elements on the page.
 * @param {number} [opts.expectedAttempts] - Expected number of attempts remaining.
 */
const assertAccessCodePagesCommonElements = ({ page, expectedAttempts }) => {
  // access code input label
  cy.assertText(page.sixDigitAccessCodeLabel(), 'Enter access code:');

  // input with correct placeholder
  page.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');

  // attempts text with exact number if provided
  if (expectedAttempts !== undefined) {
    cy.assertText(page.attemptsInfo(), `You have ${expectedAttempts} attempts remaining.`);
  }

  // suspend info text
  cy.assertText(
    page.suspendInfo(),
    'If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.',
  );

  // spam/junk advice (if page has this element)
  if (page.spamOrJunk) {
    cy.assertText(page.spamOrJunk(), 'Please check your spam or junk folders and be aware emails may sometimes take a few minutes to arrive.');
  }

  // submit button contains 'Sign in'
  if (page.submitButton) {
    cy.assertText(page.submitButton(), 'Sign in');
  }

  // optional request code link
  if (page.requestCodeLink) {
    cy.assertText(page.requestCodeLink(), 'Request a new code');
  }
};

/**
 * Standard `beforeEach` setup for 2FA OTP page specs.
 * Fetches the user from the DB, resets their OTP state (send count, tokens, status),
 * and optionally enters credentials to reach the first 2FA page.
 *
 * @param {object} user - Mock user object with at least `username` and `password`.
 * @param {object} [opts]
 * @param {boolean} [opts.login] - When `true` (default), calls `cy.enterUsernameAndPassword` after the reset.
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
 * Asserts that submitting the OTP form with an empty access code shows the
 * error summary and inline field error with the expected text 'Enter access code'.
 *
 * @param {object} page - Page object with accessCodeInput and inlineError getters.
 */
const assertEmptyCodeValidation = (page) => {
  page.accessCodeInput().clear();
  cy.clickSubmitButton();
  errorSummary().should('contain', 'Enter access code');
  cy.assertText(page.inlineError(), 'Error: Enter access code');
};

module.exports = {
  assertAccessCodePagesCommonElements,
  commonBeforeEach,
  assertEmptyCodeValidation,
};
