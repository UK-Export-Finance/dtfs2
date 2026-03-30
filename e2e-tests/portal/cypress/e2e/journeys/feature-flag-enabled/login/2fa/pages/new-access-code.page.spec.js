const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertAccessCodePagesCommonElements, assertEmptyCodeValidation } = require('../2faPageHelpers');
const { submitButton, errorSummary } = require('../../../../../partials');
const { newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');

context('2FA Page - New access code', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    const MAX_OTP_SENDS = 3;
    /**
     * Initializing the OTP send count to 1 (MAX_OTP_SENDS - 2) so when the user logs in and an OTP is sent,
     * the count becomes 2 and attemptsLeft becomes 1, which allows us to land on the new-access-code page.
     */
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: MAX_OTP_SENDS - 2 });
  });

  it('should redirect to login when visited without partial auth', () => {
    newAccessCode.visit();
    cy.url().should('eq', relative('/login'));
  });

  describe('Requesting new access code', () => {
    beforeEach(() => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should navigate to resend-another-access-code when clicking request new code', () => {
      newAccessCode.requestCodeLink().should('exist').click();
      cy.url().should('contain', '/login/resend-another-access-code');
    });

    it('should show email in description on resend page', () => {
      newAccessCode.requestCodeLink().click();
      resendAnotherAccessCode.description().should('contain', '@');
    });

    it('should show attempts info on resend page', () => {
      newAccessCode.requestCodeLink().click();
      resendAnotherAccessCode.attemptsInfo().should('exist');
    });

    it('should have csrf token on resend page', () => {
      newAccessCode.requestCodeLink().click();
      resendAnotherAccessCode.csrfToken().should('not.be.empty');
    });
  });

  describe('Form, inputs and informational paragraphs', () => {
    beforeEach(() => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    const accessCodeFormElements = [
      ['renders heading', () => newAccessCode.heading()],
      ['renders access code label', () => newAccessCode.sixDigitAccessCodeLabel()],
      ['renders description containing email', () => newAccessCode.description()],
      ['renders expiry information', () => newAccessCode.expiryInfo()],
      ['renders spam/junk advice', () => newAccessCode.spamOrJunk()],
      ['renders suspend information', () => newAccessCode.suspendInfo()],
      ['renders contact-us timeframe element', () => cy.get('[data-cy="contact-us-timeframe"]')],
    ];

    accessCodeFormElements.forEach(([title, getter]) => {
      it(`should ${title}`, () => {
        getter().should('exist');
      });
    });

    it('should have form method POST', () => {
      cy.get('form').should('have.attr', 'method', 'POST');
    });

    it('should have shared common assertions for inputs, attempts, submit and request link', () => {
      assertAccessCodePagesCommonElements({ page: newAccessCode });
      submitButton().should('exist');
    });

    it('should render access code input with correct placeholder', () => {
      newAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
    });

    it('should show attempts remaining on first visit', () => {
      newAccessCode.attemptsInfo().should('contain', '1');
    });

    it('should render contact us section', () => {
      cy.get('[data-cy="contact-us-email"]')
        .should('have.attr', 'href')
        .and('match', /^mailto:/);

      cy.get('[data-cy="contact-us-timeframe"]').should('exist');
    });

    it('should render request-code-link pointing to /login/request-new-access-code', () => {
      newAccessCode.requestCodeLink().should('have.attr', 'href', '/login/request-new-access-code');
    });
  });

  describe('Validation', () => {
    it('should show validation when submitting empty access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      assertEmptyCodeValidation();

      newAccessCode.inlineError().should('contain', 'Enter access code');
      errorSummary().should('contain', 'Enter access code');
    });

    it('should show validation when submitting wrong access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      newAccessCode.accessCodeInput().clear();
      newAccessCode.accessCodeInput().type('000000');
      cy.get('form').submit();

      errorSummary().should('exist');
      newAccessCode.inlineError().should('exist');
      newAccessCode.inlineError().should('contain', 'The access code you have entered is incorrect');
    });

    it('should show access code expired page when code expired', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.visit('/login/access-code-expired');

      cy.get('[data-cy="access-code-expired-heading"]').should('exist');
      cy.get('[data-cy="access-code-expired-security-info"]').should('exist');
    });
  });
});
