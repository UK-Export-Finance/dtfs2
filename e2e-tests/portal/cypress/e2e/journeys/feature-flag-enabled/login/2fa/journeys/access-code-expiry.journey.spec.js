const { accessCodeExpired, newAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

context('2FA Journey - Access code expiry', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('when handling partial auth session', () => {
    it('should redirect to login when accessing the expired page without partial auth', () => {
      accessCodeExpired.visit();

      cy.url().should('eq', relative('/login'));
    });

    it('should keep the partial auth session after redirecting to the expired page', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 0 });

      cy.getCookie('dtfs-session').should('exist');
    });
  });

  describe('when logging in with an expired access code', () => {
    it('should display the heading and request new code button', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 0 });

      cy.assertText(accessCodeExpired.heading(), 'Your access code has expired');
      cy.assertText(accessCodeExpired.requestNewCodeButton(), 'Request a new code');
    });

    it('should display the security and suspend information', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 0 });

      cy.assertText(
        accessCodeExpired.securityInfo(),
        'For security, access codes expire after 30 minutes. You can request for a new access code to be sent to your email address.',
      );
      cy.assertText(
        accessCodeExpired.suspendInfo(),
        'If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.',
      );
    });
  });

  describe('when displaying remaining attempts after expiry', () => {
    it('should show "You have 2 attempts remaining." when the OTP send count starts at 0', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 0 });

      cy.assertText(accessCodeExpired.attemptsInfo(), 'You have 2 attempts remaining.');
    });

    it('should show "You have 1 attempts remaining." when the OTP send count starts at 1', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 1 });

      cy.assertText(accessCodeExpired.attemptsInfo(), 'You have 1 attempts remaining.');
    });

    it('should show "You have 0 attempts remaining." when the OTP send count starts at 2', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 2 });

      cy.assertText(accessCodeExpired.attemptsInfo(), 'You have 0 attempts remaining.');
    });
  });

  describe('when requesting a new code from the expired page', () => {
    it('should redirect to new-access-code when no sends have been used', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 0 });
      accessCodeExpired.requestNewCodeButton().click();

      cy.url().should('contain', '/login/new-access-code');
    });

    it('should redirect to resend-another-access-code when one send has been used', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 1 });
      accessCodeExpired.requestNewCodeButton().click();

      cy.url().should('contain', '/login/resend-another-access-code');
    });

    it('should allow successful login after requesting a new code', () => {
      cy.submitExpiredAccessCode({ username: BANK1_MAKER1.username, count: 0 });
      accessCodeExpired.requestNewCodeButton().click();

      cy.url().should('contain', '/login/new-access-code');

      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        cy.keyboardInput(newAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
        cy.clickSubmitButton();
      });

      cy.url().should('not.contain', '/login');
    });
  });
});
