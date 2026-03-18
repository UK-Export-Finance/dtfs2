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
    resendAnotherAccessCode.heading().should('exist');
    resendAnotherAccessCode.description().should('contain', '@');
    resendAnotherAccessCode.expiryInfo().should('exist');
    resendAnotherAccessCode.spamOrJunk().should('exist');
    resendAnotherAccessCode.supportInfo().should('exist');
    resendAnotherAccessCode.suspendInfo().should('exist');
    cy.get('[data-cy="contact-us-timeframe"]').should('exist');

    // shared common assertions for inputs, attempts and submit (no request-code-link on this page)
    assertCommonElements({ page: resendAnotherAccessCode });
  });

  it('should show 0 attempts remaining on first visit', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    resendAnotherAccessCode.attemptsInfo().should('contain', '0');
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
    resendAnotherAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
  });

  describe('Validation', () => {
    it('should show validation when submitting empty access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      assertEmptyCodeValidation();
    });

    it('should show validation when submitting wrong access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      resendAnotherAccessCode.accessCodeInput().clear();
      resendAnotherAccessCode.accessCodeInput().type('000000');
      cy.get('form').submit();
      resendAnotherAccessCode.errorSummary().should('exist');
      resendAnotherAccessCode.inlineError().should('exist');
    });

    // TODO-8265: this will be refactored once the 8222 PR is merged and we can set the OTP send count to 0 and trigger expiry in the test.
    it.skip('should show access code expired page when code expired', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.visit('/login/access-code-expired');
      cy.get('[data-cy="access-code-expired-heading"]').should('exist');
      cy.get('[data-cy="access-code-expired-security-info"]').should('exist');
    });
  });
});
