const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, sharedAccessCodeFormTests } = require('../access-code-form.shared-test');
const { resendAnotherAccessCode } = require('../../../../../pages');

context('2FA Page - Resend another access code', () => {
  beforeEach(() => {
    // login: false prevents automatic login, allowing tests to manually control the login flow and OTP count setup
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should redirect to login when visited without partial auth', () => {
    resendAnotherAccessCode.visit();

    cy.url().should('eq', relative('/login'));
  });

  describe('Page elements', () => {
    beforeEach(() => {
      const MAX_OTP_SENDS = 3;
      /**
       * Initializing the OTP send count to 2 (MAX_OTP_SENDS - 1) so when the user logs in and an OTP is sent,
       * the count becomes 3 and attemptsLeft becomes 0, which allows us to land on the resend-another-access-code page
       * and test its page elements.
       */
      cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: MAX_OTP_SENDS - 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should render heading with text "We\'ve sent you another access code"', () => {
      cy.assertText(resendAnotherAccessCode.heading(), "We've sent you another access code");
    });

    it('should render description containing email', () => {
      resendAnotherAccessCode.description().should('contain', "We've sent you another email with a access code to").and('contain', BANK1_MAKER1.email);
    });

    sharedAccessCodeFormTests({
      page: resendAnotherAccessCode,
      expiryText: 'This code will expire after 30 minutes. Any previous access codes we have sent will no longer be valid.',
    });

    it('should show attempts remaining on first visit', () => {
      cy.assertText(resendAnotherAccessCode.attemptsInfo(), 'You have 0 attempts remaining.');
    });

    it('should render support information', () => {
      cy.assertText(resendAnotherAccessCode.supportInfo(), 'If you are still having problems signing in, contact us for support.');
    });

    it('should render contact us section', () => {
      resendAnotherAccessCode
        .contactUsEmail()
        .should('have.attr', 'href')
        .and('match', /^mailto:/);

      cy.assertText(resendAnotherAccessCode.contactUsTimeframe(), 'Monday to Friday, 9am to 5pm (excluding public holidays)');
    });
  });
});
