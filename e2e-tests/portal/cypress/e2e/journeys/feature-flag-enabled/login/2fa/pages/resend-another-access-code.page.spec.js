const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertAccessCodePagesCommonElements, assertEmptyCodeValidation } = require('./2faPageHelpers');
const { resendAnotherAccessCode, newAccessCode } = require('../../../../../pages');

context('2FA Page - Resend another access code', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    const MAX_OTP_SENDS = 3;
    /**
     * initializing the OTP send count to 2 so in the below tests when the user logs in and an OTP is sent, the count
     * becomes 3 and attemptsLeft becomes 0, which allows us to land on the resend-another-access-code page
     * and test its page elements.
     */
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: MAX_OTP_SENDS - 1 });
  });

  it('should redirect to login when visited without partial auth', () => {
    resendAnotherAccessCode.visit();

    cy.url().should('eq', relative('/login'));
  });

  describe('Requesting another access code', () => {
    beforeEach(() => {
      // Ensure we land on the "new access code" page before clicking the request link
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
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

    it('should have form method POST', () => {
      cy.get('form').should('have.attr', 'method', 'POST');
    });

    const accessCodeFormElements = [
      ['renders heading', () => resendAnotherAccessCode.heading()],
      ['renders description containing email', () => resendAnotherAccessCode.description()],
      ['renders expiry information', () => resendAnotherAccessCode.expiryInfo()],
      ['renders spam/junk advice', () => resendAnotherAccessCode.spamOrJunk()],
      ['renders support information', () => resendAnotherAccessCode.supportInfo()],
      ['renders suspend information', () => resendAnotherAccessCode.suspendInfo()],
      ['renders contact-us timeframe element', () => cy.get('[data-cy="contact-us-timeframe"]')],
      ['renders access code label', () => resendAnotherAccessCode.sixDigitAccessCodeLabel()],
    ];

    accessCodeFormElements.forEach(([title, getter]) => {
      it(`should ${title}`, () => {
        getter().should('exist');
      });
    });

    it('should have shared common assertions for inputs, attempts and submit', () => {
      assertAccessCodePagesCommonElements({ page: resendAnotherAccessCode });
    });

    it('should render access code input with correct placeholder', () => {
      resendAnotherAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
    });

    it('should show attempts remaining on first visit', () => {
      resendAnotherAccessCode.attemptsInfo().should('contain', '0');
    });

    it('should render contact us section', () => {
      cy.get('[data-cy="contact-us-email"]')
        .should('have.attr', 'href')
        .and('match', /^mailto:/);

      cy.get('[data-cy="contact-us-timeframe"]').should('exist');
    });
  });

  describe('Validation', () => {
    it('should show validation when submitting empty access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      assertEmptyCodeValidation();

      resendAnotherAccessCode.inlineError().should('contain', 'Enter access code');
      resendAnotherAccessCode.errorSummary().should('contain', 'Enter access code');
    });

    it('should show validation when submitting wrong access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      resendAnotherAccessCode.accessCodeInput().clear();
      resendAnotherAccessCode.accessCodeInput().type('000000');
      cy.get('form').submit();

      resendAnotherAccessCode.errorSummary().should('exist');
      resendAnotherAccessCode.inlineError().should('exist');
      resendAnotherAccessCode.inlineError().should('contain', 'The access code you have entered is incorrect');
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
