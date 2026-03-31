const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertAccessCodePagesCommonElements, assertEmptyCodeValidation } = require('../2faPageHelpers');
const { submitButton, errorSummary } = require('../../../../../partials');
const { newAccessCode, resendAnotherAccessCode, accessCodeExpired } = require('../../../../../pages');

context('2FA Page - New access code', () => {
  beforeEach(() => {
    // login: false prevents automatic login, allowing tests to manually control the login flow and OTP count setup
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should redirect to login when visited without partial auth', () => {
    newAccessCode.visit();
    cy.url().should('eq', relative('/login'));
  });

  describe('Requesting new access code', () => {
    beforeEach(() => {
      const MAX_OTP_SENDS = 3;
      /**
       * Initializing the OTP send count to 1 (MAX_OTP_SENDS - 2) so when the user logs in and an OTP is sent,
       * the count becomes 2 and attemptsLeft becomes 1, which allows us to land on the new-access-code page
       * before clicking the request link to navigate to the resend-another-access-code page.
       */
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: MAX_OTP_SENDS - 2 });
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
      resendAnotherAccessCode.attemptsInfo().should('contain', 'You have 0 attempts remaining.');
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
       * Initializing the OTP send count to 1 (MAX_OTP_SENDS - 2) so when the user logs in and an OTP is sent,
       * the count becomes 2 and attemptsLeft becomes 1, which allows us to land on the new-access-code page
       * and test its page elements.
       */
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: MAX_OTP_SENDS - 2 });
    });

    describe('Form, inputs and informational paragraphs', () => {
      beforeEach(() => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
      });

      const accessCodeFormElements = [
        ['renders heading with text "New access code sent"', () => newAccessCode.heading(), 'New access code sent'],
        ['renders access code label with text "Enter access code:"', () => newAccessCode.sixDigitAccessCodeLabel(), 'Enter access code:'],
        ['renders description containing email', () => newAccessCode.description(), "We've sent you a 6-digit access code to your email"],
        ['renders expiry information', () => newAccessCode.expiryInfo(), 'This code will expire after 30 minutes'],
        ['renders spam/junk advice', () => newAccessCode.spamOrJunk(), 'Please check your spam or junk folders'],
        ['renders suspend information', () => newAccessCode.suspendInfo(), 'If you request too many access codes your account will be suspended'],
        ['renders contact-us timeframe element', () => newAccessCode.contactUsTimeframe(), 'Monday to Friday, 9am to 5pm'],
      ];

      accessCodeFormElements.forEach(([title, getter, expectedText]) => {
        it(`should ${title}`, () => {
          getter().should('contain', expectedText);
        });
      });

      it('should have form method POST', () => {
        cy.get('form').should('have.attr', 'method', 'POST');
      });

      it('should have shared common assertions for inputs, attempts, submit and request link', () => {
        assertAccessCodePagesCommonElements({ page: newAccessCode, expectedAttempts: 1 });
        submitButton().should('contain', 'Sign in');
      });

      it('should render access code input with correct placeholder', () => {
        newAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
      });

      it('should show attempts remaining on first visit', () => {
        newAccessCode.attemptsInfo().should('contain', 'You have 1 attempts remaining.');
      });

      it('should render contact us section', () => {
        newAccessCode
          .contactUsEmail()
          .should('have.attr', 'href')
          .and('match', /^mailto:/);

        newAccessCode.contactUsTimeframe().should('contain', 'Monday to Friday, 9am to 5pm');
      });

      it('should render request-code-link pointing to /login/request-new-access-code', () => {
        newAccessCode.requestCodeLink().should('have.attr', 'href', '/login/request-new-access-code');
      });
    });

    describe('Validation', () => {
      it('should show validation when submitting empty access code', () => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
        assertEmptyCodeValidation(newAccessCode);
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

        accessCodeExpired.heading().should('contain', 'Your access code has expired');
        accessCodeExpired.securityInfo().should('contain', 'For security, access codes expire after 30 minutes');
      });
    });
  });
});
