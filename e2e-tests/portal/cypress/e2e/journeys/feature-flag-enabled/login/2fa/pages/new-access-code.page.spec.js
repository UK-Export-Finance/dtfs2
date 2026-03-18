const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertCommonElements, assertEmptyCodeValidation } = require('./2faPageHelpers');
const { newAccessCode } = require('../../../../../pages');

context('2FA Page - New access code', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    // count: 1 → login sends OTP → count becomes 2 → attemptsLeft = 3 - 2 = 1 → new-access-code page
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
  });

  it('should redirect to login when visited without partial auth', () => {
    newAccessCode.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('should allow requesting another access code and navigate to resend page', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    // click request new code link and assert navigation to resend page
    cy.get('[data-cy="request-code-link"]').should('exist').click();
    cy.url().should('contain', '/login/resend-another-access-code');
    cy.get('[data-cy="resend-another-access-code-email-sent-description"]').should('contain', '@');
    cy.get('[data-cy="access-code-attempts-info"]').should('exist');
    // csrf token should be present on the page
    cy.get('[data-cy="csrf-input"]').invoke('attr', 'value').should('not.be.empty');
  });

  it('should render form, inputs and informational paragraphs correctly', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    // form method
    cy.get('form').should('have.attr', 'method', 'POST');
    // static informational elements
    cy.get('[data-cy="new-access-code-email-sent-heading"]').should('exist');
    cy.get('[data-cy="new-access-code-email-sent-description"]').should('contain', '@');
    cy.get('[data-cy="new-access-code-email-sent-expiry-info"]').should('exist');
    cy.get('[data-cy="access-code-spam-or-junk"]').should('exist');
    cy.get('[data-cy="access-code-suspend-info"]').should('exist');
    cy.get('[data-cy="contact-us-timeframe"]').should('exist');

    // shared common assertions for inputs, attempts, submit and request link
    assertCommonElements({
      maskedEmailSelector: '[data-cy="new-access-code-email-sent-description"]',
      inputFallbackSelector: '[data-cy="six-digit-access-code-input"]',
      attemptsSelector: '[data-cy="access-code-attempts-info"]',
      requestLinkSelector: '[data-cy="request-code-link"]',
    });
  });

  it('should show 1 attempt remaining on first visit', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.get('[data-cy="access-code-attempts-info"]').should('contain', '1');
  });

  it('should render access code input with correct placeholder', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.get('[data-cy="six-digit-access-code-input"]').should('have.attr', 'placeholder', 'e.g. 123456');
  });

  it('should render contact us section', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    cy.get('[data-cy="contact-us-email"]')
      .should('have.attr', 'href')
      .and('match', /^mailto:/);
    cy.get('[data-cy="contact-us-timeframe"]').should('exist');
  });

  it('should render request-code-link pointing to /login/request-new-access-code', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.get('[data-cy="request-code-link"]').should('have.attr', 'href', '/login/request-new-access-code');
  });

  describe('Validation', () => {
    it('should show validation when submitting empty access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      assertEmptyCodeValidation({ inputSelector: '[data-cy="six-digit-access-code-input"]' });
    });

    it('should show validation when submitting wrong access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.get('[data-cy="six-digit-access-code-input"]').clear();
      cy.get('[data-cy="six-digit-access-code-input"]').type('000000');
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
