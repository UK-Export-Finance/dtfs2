const { accessCodeExpired, newAccessCode, checkYourEmailAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../2faPageHelpers');

/**
 * E2E Journey Test: Access Code Expiry
 *
 * Tests the access code expiry flow:
 * - Access codes expire after 30 minutes of inactivity
 * - Expired codes are detected by the application when submitted
 * - Users are redirected to the access-code-expired page
 * - Users can request new codes after expiry
 */
context('2FA Journey - Access code expiry', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
  });

  describe('Access code expiry detection', () => {
    it('should redirect to access-code-expired when submitting an expired OTP code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.url().should('eq', relative('/login/check-your-email-access-code'));

      // Set an expired OTP token in the database (31 minutes in the past)
      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });

      // Enter the expired access code and submit
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      // Application should detect expiry and redirect to expired page
      cy.url().should('eq', relative('/login/access-code-expired'));

      accessCodeExpired.heading().should('contain', 'Your access code has expired');
      accessCodeExpired.securityInfo().should('contain', 'For security, access codes expire after 30 minutes');
    });

    it('should display correct expiry information on access-code-expired page', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      // Set an expired OTP token
      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });

      // Submit expired code to trigger redirect
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      cy.url().should('eq', relative('/login/access-code-expired'));

      accessCodeExpired.heading().should('contain', 'Your access code has expired');
      accessCodeExpired.securityInfo().should('exist');
      accessCodeExpired.attemptsInfo().should('exist');
      accessCodeExpired.suspendInfo().should('exist');
    });

    it('should show request new code button on access-code-expired page', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      accessCodeExpired.requestNewCodeButton().should('exist');
      accessCodeExpired.requestNewCodeButton().should('have.attr', 'href').and('contain', '/login/request-new-access-code');
    });

    it('should maintain attempts remaining counter on expired page', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      accessCodeExpired.attemptsInfo().invoke('text').should('match', /\d+/);
    });
  });

  describe('Requesting new code after expiry', () => {
    it('should allow user to request new code from access-code-expired page', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      cy.url().should('eq', relative('/login/access-code-expired'));

      accessCodeExpired.requestNewCodeButton().click();

      cy.url().should('contain', '/login/new-access-code');
    });

    it('should redirect to resend-another-access-code page when requesting new code from expired page with count 1', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      cy.url().should('eq', relative('/login/access-code-expired'));

      accessCodeExpired.requestNewCodeButton().click();

      cy.url().should('contain', '/login/resend-another-access-code');
    });

    it('should allow successful login with new code after expiry', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      cy.url().should('eq', relative('/login/access-code-expired'));

      accessCodeExpired.requestNewCodeButton().click();

      cy.url().should('contain', '/login/new-access-code');

      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        newAccessCode.accessCodeInput().type(PORTAL_2FA_ACCESS_CODE);
        cy.clickSubmitButton();

        cy.url().should('not.contain', '/login');
      });
    });
  });

  describe('Expiry behavior with different OTP send counts', () => {
    it('should show access-code-expired with 2 attempts remaining when count is 0', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      accessCodeExpired.attemptsInfo().invoke('text').should('contain', '2');
    });

    it('should show access-code-expired with 1 attempt remaining when count is 1', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      accessCodeExpired.attemptsInfo().invoke('text').should('contain', '1');
    });

    it('should show access-code-expired with 0 attempts remaining when count is 2', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      accessCodeExpired.attemptsInfo().invoke('text').should('contain', '0');
    });
  });

  describe('Security messaging on expiry', () => {
    it('should display security reason for expiry', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      accessCodeExpired.securityInfo().should('contain', 'security');
    });

    it('should inform user about suspension after too many failed attempts', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      accessCodeExpired.suspendInfo().should('exist');
      accessCodeExpired
        .suspendInfo()
        .invoke('text')
        .should('match', /suspend|temporarily blocked/i);
    });
  });

  describe('Navigation behavior from expired page', () => {
    it('should redirect to login when accessing expired page without partial auth', () => {
      accessCodeExpired.visit();
      cy.url().should('eq', relative('/login'));
    });

    it('should maintain session after viewing expired page', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      cy.getCookie('dtfs-session').should('exist');
    });

    it('should allow navigation back to check-your-email from expired page', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });
      cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();

      cy.url().should('eq', relative('/login/access-code-expired'));

      cy.visit('/login/check-your-email-access-code');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });
  });
});
