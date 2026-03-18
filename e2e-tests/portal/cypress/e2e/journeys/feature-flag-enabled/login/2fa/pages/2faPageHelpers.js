/**
 * Asserts common elements present on all 2FA OTP pages: masked email, CSRF token,
 * access code input, attempts remaining text, submit button, and optional request-code link.
 * Prefers page object getters when a `page` object is supplied; falls back to
 * default `data-cy` selectors otherwise.
 *
 * @param {object} [opts]
 * @param {string} [opts.maskedEmailSelector] - Fallback selector for the masked email element.
 * @param {string} [opts.inputFallbackSelector] - Fallback selector for the OTP input.
 * @param {string} [opts.attemptsSelector] - Fallback selector for the attempts-remaining element.
 * @param {string} [opts.csrfSelector] - Fallback selector for the hidden CSRF input.
 * @param {string} [opts.submitSelector] - Fallback selector for the submit button.
 * @param {string} [opts.submitText] - Expected text on the submit button.
 * @param {string} [opts.requestLinkSelector] - Fallback selector for the request-new-code link.
 * @param {object} [opts.page] - Page object exposing getter functions for elements on the page.
 */
const assertCommonElements = ({
  maskedEmailSelector,
  inputFallbackSelector = '[data-cy="access-code-input"]',
  attemptsSelector = '[data-cy="access-code-attempts-info"]',
  csrfSelector = '[data-cy="csrf-input"]',
  submitSelector = '[data-cy="submit-button"]',
  submitText = 'Sign in',
  requestLinkSelector,
  page,
} = {}) => {
  // prefer page object getters when a page object is provided
  if (page) {
    // masked email / description
    if (page.description) {
      page.description().invoke('text').should('match', /@/);
    } else if (page.obscuredSignInLinkTargetEmailAddressText) {
      page.obscuredSignInLinkTargetEmailAddressText().should('contain', '@');
    } else if (maskedEmailSelector) {
      cy.get(maskedEmailSelector).invoke('text').should('match', /@/);
    }
  } else if (maskedEmailSelector) {
    cy.get(maskedEmailSelector).invoke('text').should('match', /@/);
  }

  // csrf token
  if (page && page.csrfToken) {
    page.csrfToken().then((token) => {
      expect(token).to.be.a('string');
      expect(token).to.not.equal('');
    });
  } else {
    cy.get(csrfSelector).should('have.attr', 'value').and('not.be.empty');
  }

  // input fallback selector and placeholder
  if (page && page.accessCodeInput) {
    page.accessCodeInput().should('exist');
  } else {
    cy.get(inputFallbackSelector).should('exist').and('have.attr', 'placeholder', 'e.g. 123456');
  }

  // attempts text contains a number
  if (page && page.attemptsInfo) {
    page
      .attemptsInfo()
      .invoke('text')
      .then((text) => expect(text).to.match(/\d+/));
  } else {
    cy.get(attemptsSelector)
      .invoke('text')
      .then((text) => {
        expect(text).to.match(/\d+/);
      });
  }

  // submit button
  if (page && page.submitButton) {
    page.submitButton().should('exist').and('contain', submitText);
  } else {
    cy.get(submitSelector).should('exist').and('contain', submitText);
  }

  // optional request link existence assertion
  if (page && page.requestCodeLink) {
    page.requestCodeLink().should('exist');
  } else if (page && page.requestNewSignInLink) {
    page.requestNewSignInLink().should('exist');
  } else if (requestLinkSelector) {
    cy.get(requestLinkSelector).should('exist');
  }
};

/**
 * Clicks the request-new-code link and asserts the browser navigates to the
 * expected redirect URL, then optionally checks the masked email element is present.
 *
 * @param {object} [opts]
 * @param {string} [opts.requestLinkSelector] - Selector for the request-new-code link.
 * @param {string} [opts.redirectUrl] - URL fragment the browser should navigate to after clicking.
 * @param {string} [opts.maskedEmailSelector] - Selector for the masked email element on the redirect page.
 */
const clickRequestNewCodeAndAssertRedirect = ({
  requestLinkSelector = '[data-cy="request-new-sign-in-link"]',
  redirectUrl = '/login/check-your-email',
  maskedEmailSelector = '[data-cy="obscured-sign-in-link-target-email-address"]',
} = {}) => {
  cy.get(requestLinkSelector).should('exist').click();
  cy.url().should('contain', redirectUrl);
  if (maskedEmailSelector) {
    cy.get(maskedEmailSelector).should('exist');
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
  cy.getUserByUsername(username).then(() => {});
  cy.resetPortalUserStatusAndNumberOfSignInOTPs(username);
  if (opts.login) {
    cy.enterUsernameAndPassword(user);
  }
};

/**
 * Asserts that submitting the OTP form with an empty access code shows the
 * error summary and the inline field error.
 *
 * @param {object} [opts]
 * @param {string} [opts.inputSelector] - Selector for the OTP input to clear before submission.
 * @param {string} [opts.inlineErrorSelector] - Selector for the inline validation error element.
 */
const assertEmptyCodeValidation = ({
  inputSelector = '[data-cy="access-code-input"]',
  inlineErrorSelector = '[data-cy="six-digit-access-code-inline-error"]',
} = {}) => {
  cy.get(inputSelector).clear();
  cy.get('form').submit();
  cy.get('[data-cy="error-summary"]').should('exist');
  cy.get(inlineErrorSelector).should('exist');
};

module.exports = {
  assertCommonElements,
  clickRequestNewCodeAndAssertRedirect,
  commonBeforeEach,
  assertEmptyCodeValidation,
};
