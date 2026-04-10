const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, sharedAccessCodeFormTests } = require('../access-code-form.shared-test');
const { newAccessCode } = require('../../../../../pages');

context('2FA Page - New access code', () => {
  beforeEach(() => {
    // login: false prevents automatic login, allowing tests to manually control the login flow and OTP count setup
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should redirect to login when visited without partial auth', () => {
    newAccessCode.visit();

    cy.url().should('eq', relative('/login'));
  });

  describe('Page elements', () => {
    beforeEach(() => {
      const MAX_OTP_SENDS = 3;
      /**
       * Initializing the OTP send count to 1 (MAX_OTP_SENDS - 2) so when the user logs in and an OTP is sent,
       * the count becomes 2 and attemptsLeft becomes 1, which allows us to land on the new-access-code page
       * and test its page elements.
       */
      cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: MAX_OTP_SENDS - 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should render heading with text "New access code sent"', () => {
      cy.assertText(newAccessCode.heading(), 'New access code sent');
    });

    it('should render description containing email', () => {
      newAccessCode.description().should('contain', "We've sent you a 6-digit access code to your email").and('contain', BANK1_MAKER1.email);
    });

    sharedAccessCodeFormTests({
      page: newAccessCode,
      expiryText: "We've sent you a new email with a different access code to sign in. This code will expire after 30 minutes.",
      requestCodeHref: '/login/request-new-access-code',
    });

    it('should show attempts remaining on first visit', () => {
      cy.assertText(newAccessCode.attemptsInfo(), 'You have 1 attempts remaining.');
    });

    it('should render contact us section', () => {
      newAccessCode
        .contactUsEmail()
        .should('have.attr', 'href')
        .and('match', /^mailto:/);

      cy.assertText(newAccessCode.contactUsTimeframe(), 'Monday to Friday, 9am to 5pm (excluding public holidays)');
    });
  });
});
