const { checkYourEmail, checkYourEmailAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertCommonElements, assertEmptyCodeValidation } = require('./2faPageHelpers');

context('2FA Page - Check your email', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
  });

  it('should redirect to login when visited without partial auth', () => {
    checkYourEmail.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('should allow requesting a new access code and show email address and attempts remaining', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    // should be on check-your-email-access-code page after login, click request new code link
    checkYourEmailAccessCode.requestCodeLink().should('exist').click();
    // should now be on new-access-code page showing email and attempts
    cy.url().should('contain', '/login/new-access-code');
    cy.get('[data-cy="new-access-code-email-sent-description"]').should('contain', '@');
    cy.get('[data-cy="access-code-attempts-info"]').should('exist');
    // csrf token should be present on the page
    checkYourEmailAccessCode.csrfToken().should('not.be.empty');
  });

  it('should render form, inputs and informational paragraphs correctly', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    // form action and method
    cy.get('form').should('have.attr', 'method', 'POST');
    cy.get('form').should('have.attr', 'action', '/login/check-your-email-access-code');
    // static informational elements
    checkYourEmailAccessCode.heading().should('exist');
    checkYourEmailAccessCode.description().should('contain', '@');
    checkYourEmailAccessCode.expiryInfo().should('exist');
    checkYourEmailAccessCode.spamOrJunk().should('exist');
    checkYourEmailAccessCode.suspendInfo().should('exist');

    // shared common assertions for inputs, attempts, submit and request link
    assertCommonElements({ page: checkYourEmailAccessCode });
  });

  it('should show 2 attempts remaining on first visit', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    checkYourEmailAccessCode.attemptsInfo().should('contain', '2');
  });

  it('should render access code input with correct placeholder', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    checkYourEmailAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
  });

  it('should render request-code-link pointing to /login/request-new-access-code', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    checkYourEmailAccessCode.requestCodeLink().should('have.attr', 'href', '/login/request-new-access-code');
  });

  describe('Validation', () => {
    it('should show validation when submitting empty access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      assertEmptyCodeValidation({ inputSelector: '[data-cy="access-code-input"]' });
    });

    it('should show validation when submitting wrong access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('000000');
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
