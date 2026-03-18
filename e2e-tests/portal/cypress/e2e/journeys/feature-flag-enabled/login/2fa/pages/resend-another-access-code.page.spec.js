const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertCommonElements, assertEmptyCodeValidation } = require('./2faPageHelpers');
const { resendAnotherAccessCode } = require('../../../../../pages');

context('2FA Page - Resend another access code', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    // count: 2 → login sends OTP → count becomes 3 → attemptsLeft = 3 - 3 = 0 → resend-another-access-code page
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
  });

  it('should redirect to login when visited without partial auth', () => {
    resendAnotherAccessCode.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('should render form, inputs and informational paragraphs correctly', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    // form method
    cy.get('form').should('have.attr', 'method', 'POST');
    // static informational elements
    cy.get('[data-cy="resend-another-access-code-email-sent-heading"]').should('exist');
    cy.get('[data-cy="resend-another-access-code-email-sent-description"]').should('contain', '@');
    cy.get('[data-cy="resend-another-access-code-email-sent-expiry-info"]').should('exist');
    cy.get('[data-cy="access-code-spam-or-junk"]').should('exist');
    cy.get('[data-cy="access-code-support-info"]').should('exist');
    cy.get('[data-cy="access-code-suspend-info"]').should('exist');
    cy.get('[data-cy="contact-us-timeframe"]').should('exist');

    // shared common assertions for inputs, attempts and submit (no request-code-link on this page)
    assertCommonElements({
      maskedEmailSelector: '[data-cy="resend-another-access-code-email-sent-description"]',
      inputFallbackSelector: '[data-cy="access-code-input"]',
      attemptsSelector: '[data-cy="access-code-attempts-info"]',
      requestLinkSelector: null,
    });
  });

  it('should show 0 attempts remaining on first visit', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.get('[data-cy="access-code-attempts-info"]').should('contain', '0');
  });

  it('should render contact us section', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    cy.get('[data-cy="contact-us-email"]')
      .should('have.attr', 'href')
      .and('match', /^mailto:/);
    cy.get('[data-cy="contact-us-timeframe"]').should('exist');
  });

  it('should render access code input with correct placeholder', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.get('[data-cy="access-code-input"]').should('have.attr', 'placeholder', 'e.g. 123456');
  });

  describe('Validation', () => {
    it('should show validation when submitting empty access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      assertEmptyCodeValidation({ inputSelector: '[data-cy="access-code-input"]' });
    });

    it('should show validation when submitting wrong access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.get('[data-cy="access-code-input"]').clear();
      cy.get('[data-cy="access-code-input"]').type('000000');
      cy.get('form').submit();
      cy.get('[data-cy="error-summary"]').should('exist');
      cy.get('[data-cy="six-digit-access-code-inline-error"]').should('exist');
    });

    it('should show access code expired page when code expired', () => {
      // TODO-8265: this will be enabled once the 8222 PR is merged and we can set the OTP send count to 0 and trigger expiry in the test.
      // cy.enterUsernameAndPassword(BANK1_MAKER1);
      // cy.visit('/login/access-code-expired');
      // cy.get('[data-cy="access-code-expired-heading"]').should('exist');
      // cy.get('[data-cy="access-code-expired-security-info"]').should('exist');
    });
  });
});
