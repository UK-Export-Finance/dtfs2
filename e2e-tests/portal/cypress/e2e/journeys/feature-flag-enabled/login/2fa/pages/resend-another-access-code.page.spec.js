const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertAccessCodePagesCommonElements, assertEmptyCodeValidation } = require('../2faPageHelpers');
const { submitButton, errorSummary } = require('../../../../../partials');
const { resendAnotherAccessCode, newAccessCode, accessCodeExpired } = require('../../../../../pages');

context('2FA Page - Resend another access code', () => {
  beforeEach(() => {
    // login: false prevents automatic login, allowing tests to manually control the login flow and OTP count setup
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should redirect to login when visited without partial auth', () => {
    resendAnotherAccessCode.visit();

    cy.url().should('eq', relative('/login'));
  });

  describe('Requesting another access code', () => {
    beforeEach(() => {
      /**
       * Initializing the OTP send count to 1 (MAX_OTP_SENDS - 2) so when the user logs in and an OTP is sent,
       * the count becomes 2 and attemptsLeft becomes 1, which allows us to land on the new-access-code page
       * before clicking the request link to navigate to the resend-another-access-code page.
       */
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    /**
     * The following tests verify navigation from new-access-code page to resend-another-access-code page
     * by clicking the "Request a new access code" link, which sends another OTP and increments the count to 3.
     */
    it('should navigate to resend-another-access-code when clicking request new code', () => {
      newAccessCode.requestCodeLink().should('exist').click();
      cy.url().should('contain', '/login/resend-another-access-code');
    });

    it('should show email in description on resend page', () => {
      newAccessCode.requestCodeLink().click();
      resendAnotherAccessCode.description().should('contain', "We've sent you another email with a access code to");
    });

    it('should show attempts info on resend page', () => {
      newAccessCode.requestCodeLink().click();
      cy.assertText(resendAnotherAccessCode.attemptsInfo(), 'You have 0 attempts remaining.');
    });

    it('should have csrf token on resend page', () => {
      newAccessCode.requestCodeLink().click();
      resendAnotherAccessCode.csrfToken().should('not.be.empty');
    });
  });

  describe('Page elements and validation', () => {
    beforeEach(() => {
      const MAX_OTP_SENDS = 3;
      /**
       * Initializing the OTP send count to 2 (MAX_OTP_SENDS - 1) so when the user logs in and an OTP is sent,
       * the count becomes 3 and attemptsLeft becomes 0, which allows us to land on the resend-another-access-code page
       * and test its page elements.
       */
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: MAX_OTP_SENDS - 1 });
    });

    describe('Form, inputs and informational paragraphs', () => {
      beforeEach(() => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
      });

      it('should have form method POST', () => {
        cy.get('form').should('have.attr', 'method', 'POST');
      });

      const accessCodeFormElements = [
        ['renders heading with text "We\'ve sent you another access code"', () => resendAnotherAccessCode.heading(), "We've sent you another access code"],
        ['renders description containing email', () => resendAnotherAccessCode.description(), "We've sent you another email with a access code to"],
        ['renders expiry information', () => resendAnotherAccessCode.expiryInfo(), 'This code will expire after 30 minutes'],
        ['renders spam/junk advice', () => resendAnotherAccessCode.spamOrJunk(), 'Please check your spam or junk folders'],
        ['renders support information', () => resendAnotherAccessCode.supportInfo(), 'If you are still having problems signing in, contact us for support.'],
        ['renders suspend information', () => resendAnotherAccessCode.suspendInfo(), 'If you request too many access codes your account will be suspended'],
        ['renders contact-us timeframe element', () => resendAnotherAccessCode.contactUsTimeframe(), 'Monday to Friday, 9am to 5pm'],
        ['renders access code label', () => resendAnotherAccessCode.sixDigitAccessCodeLabel(), 'Enter access code:'],
      ];

      accessCodeFormElements.forEach(([title, getter, expectedText]) => {
        it(`should ${title}`, () => {
          cy.assertText(getter(), expectedText);
        });
      });

      it('should have shared common assertions for inputs, attempts and submit', () => {
        assertAccessCodePagesCommonElements({ page: resendAnotherAccessCode, expectedAttempts: 0 });
        cy.assertText(submitButton(), 'Sign in');
      });

      it('should render access code input with correct placeholder', () => {
        resendAnotherAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
      });

      it('should show attempts remaining on first visit', () => {
        cy.assertText(resendAnotherAccessCode.attemptsInfo(), 'You have 0 attempts remaining.');
      });

      it('should render contact us section', () => {
        resendAnotherAccessCode
          .contactUsEmail()
          .should('have.attr', 'href')
          .and('match', /^mailto:/);

        cy.assertText(resendAnotherAccessCode.contactUsTimeframe(), 'Monday to Friday, 9am to 5pm');
      });
    });

    describe('Validation', () => {
      it('should show validation when submitting empty access code', () => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
        assertEmptyCodeValidation(resendAnotherAccessCode);
      });

      it('should show validation when submitting wrong access code', () => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
        resendAnotherAccessCode.accessCodeInput().clear();
        resendAnotherAccessCode.accessCodeInput().type('000000');
        cy.get('form').submit();

        errorSummary().should('exist');
        resendAnotherAccessCode.inlineError().should('exist');
        cy.assertText(resendAnotherAccessCode.inlineError(), 'The access code you have entered is incorrect');
      });

      it('should show access code expired page when code expired', () => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
        cy.visit('/login/access-code-expired');

        cy.assertText(accessCodeExpired.heading(), 'Your access code has expired');
        cy.assertText(
          accessCodeExpired.securityInfo(),
          'For security, access codes expire after 30 minutes. You can request for a new access code to be sent to your email address.',
        );
      });
    });
  });
});
