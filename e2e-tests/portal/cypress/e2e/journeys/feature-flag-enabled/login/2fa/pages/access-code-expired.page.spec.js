const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');
const { accessCodeExpired, checkYourEmailAccessCode } = require('../../../../../pages');

context('2FA Page - Access code expired', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: 0 });
  });

  describe('when visited without partial auth', () => {
    it('should redirect to login', () => {
      accessCodeExpired.visit();
      cy.url().should('eq', relative('/login'));
    });
  });

  describe('after submitting an expired code', () => {
    beforeEach(() => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.url().should('include', '/login/check-your-email-access-code');

      // Set expired OTP in database
      cy.overridePortalUserSignInOTPWithExpiredToken({ username: BANK1_MAKER1.username });

      // Enter the expired access code and submit
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      // App should detect expiry and redirect to expired page
      cy.url().should('eq', relative('/login/access-code-expired'));
    });

    it('should show the expired page heading', () => {
      cy.assertText(accessCodeExpired.heading(), 'Your access code has expired');
    });

    it('should show the security info text', () => {
      cy.assertText(
        accessCodeExpired.securityInfo(),
        'For security, access codes expire after 30 minutes. You can request for a new access code to be sent to your email address.',
      );
    });

    it('should display attempts remaining information', () => {
      accessCodeExpired.attemptsInfo().should('contain', 'You have');
      accessCodeExpired.attemptsInfo().should('contain', 'attempts remaining.');
    });

    it('should show the suspend info text', () => {
      cy.assertText(
        accessCodeExpired.suspendInfo(),
        'If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.',
      );
    });

    it('should show request new code button', () => {
      cy.assertText(accessCodeExpired.requestNewCodeButton(), 'Request a new code');
    });
  });
});
