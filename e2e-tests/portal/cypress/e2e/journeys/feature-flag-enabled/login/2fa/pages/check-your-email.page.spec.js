const { checkYourEmail, checkYourEmailAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

const { commonBeforeEach, sharedAccessCodeFormTests } = require('../access-code-form.shared-test');

context('2FA Page - Check your email', () => {
  beforeEach(() => {
    // login: false prevents automatic login, allowing tests to manually control the login flow and OTP count setup
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should redirect to login when visited without partial auth', () => {
    checkYourEmail.visit();

    cy.url().should('eq', relative('/login'));
  });

  describe('Page elements', () => {
    beforeEach(() => {
      /**
       * Initializing the OTP send count to 0 so when the user logs in and an OTP is sent,
       * the count becomes 1 and attemptsLeft becomes 2, which allows us to land on the check-your-email-access-code page
       * and test its page elements.
       */
      cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should render heading with text "Check your email"', () => {
      cy.assertText(checkYourEmailAccessCode.heading(), 'Check your email');
    });

    it('should render description containing email', () => {
      cy.assertText(checkYourEmailAccessCode.description(), `We have sent you a 6-digit access code to your email ${BANK1_MAKER1.email}.`);
    });

    sharedAccessCodeFormTests({
      page: checkYourEmailAccessCode,
      expiryText: 'This code will expire after 30 minutes.',
      requestCodeHref: '/login/request-new-access-code',
    });

    it('should show attempts remaining on first visit', () => {
      cy.assertText(checkYourEmailAccessCode.attemptsInfo(), 'You have 2 attempts remaining.');
    });
  });
});
