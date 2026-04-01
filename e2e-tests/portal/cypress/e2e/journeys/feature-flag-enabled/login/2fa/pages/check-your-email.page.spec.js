const { checkYourEmail, checkYourEmailAccessCode, newAccessCode, accessCodeExpired } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertAccessCodePagesCommonElements, assertEmptyCodeValidation } = require('../2faPageHelpers');
const { submitButton, errorSummary } = require('../../../../../partials');

context('2FA Page - Check your email', () => {
  beforeEach(() => {
    // login: false prevents automatic login, allowing tests to manually control the login flow and OTP count setup
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should redirect to login when visited without partial auth', () => {
    checkYourEmail.visit();

    cy.url().should('eq', relative('/login'));
  });

  describe('Requesting a new access code', () => {
    beforeEach(() => {
      /**
       * Initializing the OTP send count to 0 so when the user logs in and an OTP is sent,
       * the count becomes 1 and attemptsLeft becomes 2, which allows us to land on the check-your-email-access-code page
       * before clicking the request link to navigate to the new-access-code page.
       */
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    /**
     * The following tests verify navigation from check-your-email-access-code page to new-access-code page
     * by clicking the "Request a new access code" link, which sends another OTP and increments the count to 2.
     */
    it('should navigate to new-access-code when clicking request new code', () => {
      checkYourEmailAccessCode.requestCodeLink().should('exist').click();

      cy.url().should('contain', '/login/new-access-code');
    });
    it('should show email in description on new-access-code', () => {
      checkYourEmailAccessCode.requestCodeLink().click();

      newAccessCode.description().should('contain', "We've sent you a 6-digit access code to your email");
    });
    it('should show attempts info on new-access-code', () => {
      checkYourEmailAccessCode.requestCodeLink().click();

      cy.assertText(newAccessCode.attemptsInfo(), 'You have 1 attempts remaining.');
    });
  });

  describe('Page elements and validation', () => {
    beforeEach(() => {
      /**
       * Initializing the OTP send count to 0 so when the user logs in and an OTP is sent,
       * the count becomes 1 and attemptsLeft becomes 2, which allows us to land on the check-your-email-access-code page
       * and test its page elements.
       */
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
    });

    describe('Form, inputs and informational paragraphs', () => {
      beforeEach(() => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
      });

      it('should have form method POST', () => {
        cy.get('form').should('have.attr', 'method', 'POST');
      });

      it('should have correct form action', () => {
        cy.get('form').should('have.attr', 'action', '/login/check-your-email-access-code');
      });

      it('should render description containing email', () => {
        checkYourEmailAccessCode.description().should('contain', 'We have sent you a 6-digit access code to your email');
      });

      const accessCodeFormElements = [
        ['renders heading with text "Check your email"', () => checkYourEmailAccessCode.heading(), 'Check your email'],
        ['renders access code label with text "Enter access code:"', () => checkYourEmailAccessCode.sixDigitAccessCodeLabel(), 'Enter access code:'],
        ['renders expiry information with text about 30 minutes', () => checkYourEmailAccessCode.expiryInfo(), 'This code will expire after 30 minutes.'],
        ['renders spam/junk advice', () => checkYourEmailAccessCode.spamOrJunk(), 'Please check your spam or junk folders'],
        ['renders suspend information', () => checkYourEmailAccessCode.suspendInfo(), 'If you request too many access codes your account will be suspended'],
      ];

      accessCodeFormElements.forEach(([title, getter, expectedText]) => {
        it(`should ${title}`, () => {
          cy.assertText(getter(), expectedText);
        });
      });

      it('should have shared common assertions for inputs, attempts, submit and request link', () => {
        assertAccessCodePagesCommonElements({ page: checkYourEmailAccessCode, expectedAttempts: 2 });
        cy.assertText(submitButton(), 'Sign in');
      });

      it('should render access code input with correct placeholder', () => {
        checkYourEmailAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
      });

      it('should show attempts remaining on first visit', () => {
        cy.assertText(checkYourEmailAccessCode.attemptsInfo(), 'You have 2 attempts remaining.');
      });

      it('should render request-code-link pointing to /login/request-new-access-code', () => {
        checkYourEmailAccessCode.requestCodeLink().should('have.attr', 'href', '/login/request-new-access-code');
      });
    });

    describe('Validation', () => {
      it('should show validation when submitting empty access code', () => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
        assertEmptyCodeValidation(checkYourEmailAccessCode);
      });

      it('should show validation when submitting wrong access code', () => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);
        checkYourEmailAccessCode.accessCodeInput().clear();
        checkYourEmailAccessCode.accessCodeInput().type('000000');
        cy.get('form').submit();

        errorSummary().should('exist');
        checkYourEmailAccessCode.inlineError().should('exist');
        cy.assertText(checkYourEmailAccessCode.inlineError(), 'The access code you have entered is incorrect');
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
