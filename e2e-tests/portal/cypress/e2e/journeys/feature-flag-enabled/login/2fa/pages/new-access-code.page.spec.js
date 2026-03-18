const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertCommonElements, assertEmptyCodeValidation } = require('./2faPageHelpers');
const { newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');

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
    newAccessCode.requestCodeLink().should('exist').click();
    cy.url().should('contain', '/login/resend-another-access-code');
    resendAnotherAccessCode.description().should('contain', '@');
    resendAnotherAccessCode.attemptsInfo().should('exist');
    // csrf token should be present on the page
    resendAnotherAccessCode.csrfToken().should('not.be.empty');
  });

  it('should render form, inputs and informational paragraphs correctly', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    // form method
    cy.get('form').should('have.attr', 'method', 'POST');
    // static informational elements
    newAccessCode.heading().should('exist');
    newAccessCode.description().should('contain', '@');
    newAccessCode.expiryInfo().should('exist');
    newAccessCode.spamOrJunk().should('exist');
    newAccessCode.suspendInfo().should('exist');
    cy.get('[data-cy="contact-us-timeframe"]').should('exist');

    // shared common assertions for inputs, attempts, submit and request link
    assertCommonElements({ page: newAccessCode });
  });

  it('should show 1 attempt remaining on first visit', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    newAccessCode.attemptsInfo().should('contain', '1');
  });

  it('should render access code input with correct placeholder', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    newAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
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
    newAccessCode.requestCodeLink().should('have.attr', 'href', '/login/request-new-access-code');
  });

  describe('Validation', () => {
    it('should show validation when submitting empty access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      assertEmptyCodeValidation();
    });

    it('should show validation when submitting wrong access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      newAccessCode.accessCodeInput().clear();
      newAccessCode.accessCodeInput().type('000000');
      cy.get('form').submit();
      newAccessCode.errorSummary().should('exist');
      newAccessCode.inlineError().should('exist');
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
