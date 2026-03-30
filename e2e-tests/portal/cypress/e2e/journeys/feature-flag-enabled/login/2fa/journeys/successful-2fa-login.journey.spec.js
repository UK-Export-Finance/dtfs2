const { checkYourEmailAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../2faPageHelpers');

/**
 * E2E Journey Test: Successful 2FA Login Flow
 *
 * Tests the complete happy path from entering credentials through OTP verification
 * to successfully reaching the dashboard.
 */
context('2FA Journey - Successful login flow', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
  });

  describe('Complete successful 2FA journey', () => {
    it('should redirect to check-your-email page after entering valid credentials', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      checkYourEmailAccessCode.heading().should('exist');
      checkYourEmailAccessCode.description().should('contain', '@');
    });

    it('should successfully login and reach dashboard after entering correct access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('eq', relative('/login/check-your-email-access-code'));

      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
        cy.clickSubmitButton();

        cy.url().should('not.contain', '/login');
        cy.url().should('match', /\/(dashboard|deals|contracts)/);
      });
    });

    it('should allow user to access protected routes after successful 2FA', () => {
      cy.loginOTP(BANK1_MAKER1);

      cy.url().should('not.contain', '/login');

      cy.visit('/dashboard');
      cy.url().should('contain', '/dashboard');
    });

    it('should maintain session after successful 2FA login', () => {
      cy.loginOTP(BANK1_MAKER1);

      cy.getCookie('dtfs-session').should('exist');

      cy.visit('/dashboard');
      cy.url().should('contain', '/dashboard');

      cy.visit('/user/profile');
      cy.url().should('contain', '/user/profile');
    });
  });

  describe('User state after successful login', () => {
    it('should not allow revisiting 2FA pages after successful login', () => {
      cy.loginOTP(BANK1_MAKER1);

      cy.visit('/login/check-your-email-access-code');
      cy.url().should('not.contain', '/login/check-your-email-access-code');
      cy.url().should('not.contain', '/login');
    });

    it('should redirect to home when trying to access new-access-code page after successful login', () => {
      cy.loginOTP(BANK1_MAKER1);

      cy.visit('/login/new-access-code');
      cy.url().should('not.contain', '/login/new-access-code');
      cy.url().should('not.contain', '/login');
    });

    it('should redirect to home when trying to access resend-another-access-code page after successful login', () => {
      cy.loginOTP(BANK1_MAKER1);

      cy.visit('/login/resend-another-access-code');
      cy.url().should('not.contain', '/login/resend-another-access-code');
      cy.url().should('not.contain', '/login');
    });
  });
});
