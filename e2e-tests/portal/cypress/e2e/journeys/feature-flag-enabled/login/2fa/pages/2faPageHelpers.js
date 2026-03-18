const assertCommonElements = ({
  maskedEmailSelector,
  inputFallbackSelector = '[data-cy="six-digit-access-code-input"]',
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
  if (page && page.sixDigitInput) {
    page.sixDigitInput().should('exist');
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

const commonBeforeEach = (user, opts = { login: true }) => {
  const { username } = user;
  cy.getUserByUsername(username).then(() => {});
  cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
  if (opts.login) {
    cy.enterUsernameAndPassword(user);
  }
};

const assertEmptyCodeValidation = ({
  inputSelector = '[data-cy="six-digit-access-code-input"]',
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
