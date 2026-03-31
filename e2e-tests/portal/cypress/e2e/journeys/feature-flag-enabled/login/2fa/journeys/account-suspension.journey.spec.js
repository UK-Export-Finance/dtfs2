const { temporarilySuspendedAccessCode, checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../2faPageHelpers');

/**
 * E2E Journey Test: Account Suspension After Too Many Attempts
 *
 * Tests the account suspension flow:
 * - Account is temporarily suspended after 3 failed OTP send attempts
 * - User is redirected to temporarily-suspended-access-code page
 * - Appropriate error messages and contact information are displayed
 * - User cannot access protected routes while suspended
 * - User cannot request more codes while suspended
 */
context('2FA Journey - Account suspension after too many attempts', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('Triggering account suspension', () => {
    it('should redirect to temporarily-suspended page after exhausting all attempts', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/temporarily-suspended-access-code');
      temporarilySuspendedAccessCode.heading().should('exist');
    });

    it('should display suspension heading and message', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      temporarilySuspendedAccessCode.heading().should('contain', 'temporarily suspended');
      temporarilySuspendedAccessCode.message().should('contain', 'failed attempts');
    });

    it('should show contact information on suspension page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      temporarilySuspendedAccessCode
        .contactUsEmail()
        .should('exist')
        .and('have.attr', 'href')
        .and('match', /^mailto:/);
      temporarilySuspendedAccessCode.contactUsTimeframe().should('exist');
    });

    it('should not display access code input on suspension page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      newAccessCode.accessCodeInput().should('not.exist');
      newAccessCode.submitButton().should('not.exist');
    });

    it('should not display request new code link on suspension page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      newAccessCode.requestCodeLink().should('not.exist');
    });
  });

  describe('Journey to suspension - complete flow', () => {
    it('should show decreasing attempts through check-your-email, new-access-code, resend-another-access-code, then suspension', () => {
      // Start with count 0 - check-your-email (2 attempts)
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      checkYourEmailAccessCode.attemptsInfo().should('contain', '2');

      // Reset and progress to count 1 - new-access-code (1 attempt)
      cy.resetPortalUserStatusAndNumberOfSignInOTPs(BANK1_MAKER1.username);
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/new-access-code');
      newAccessCode.attemptsInfo().should('contain', '1');

      // Reset and progress to count 2 - resend-another-access-code (0 attempts)
      cy.resetPortalUserStatusAndNumberOfSignInOTPs(BANK1_MAKER1.username);
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/resend-another-access-code');
      resendAnotherAccessCode.attemptsInfo().should('contain', '0');

      // Reset and progress to count 3 - temporarily-suspended
      cy.resetPortalUserStatusAndNumberOfSignInOTPs(BANK1_MAKER1.username);
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/temporarily-suspended-access-code');
      temporarilySuspendedAccessCode.heading().should('exist');
    });
  });

  describe('Suspension page access control', () => {
    it('should redirect to login when accessing suspension page without partial auth', () => {
      temporarilySuspendedAccessCode.visit();
      cy.url().should('eq', relative('/login'));
    });

    it('should allow access to suspension page with partial auth', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/temporarily-suspended-access-code');
    });

    it('should maintain session cookie on suspension page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.getCookie('dtfs-session').should('exist');
    });
  });

  describe('Blocked user cannot access protected routes', () => {
    beforeEach(() => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/temporarily-suspended-access-code');
    });

    it('should redirect to login when attempting to access dashboard while suspended', () => {
      cy.visit('/dashboard');
      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when attempting to access user profile while suspended', () => {
      cy.visit('/user/profile');
      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when attempting to access contracts while suspended', () => {
      cy.visit('/contract/12345');
      cy.url().should('eq', relative('/login'));
    });
  });

  describe('Suspension messaging', () => {
    beforeEach(() => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should explain the reason for suspension', () => {
      temporarilySuspendedAccessCode.message().should('contain', 'failed attempts');
      temporarilySuspendedAccessCode.message().should('contain', 'too many');
    });

    it('should provide contact email for support', () => {
      temporarilySuspendedAccessCode.contactUsEmail().should('have.attr', 'href').and('include', 'mailto:');
    });

    it('should indicate timeframe for resolution', () => {
      temporarilySuspendedAccessCode.contactUsTimeframe().should('exist');
      temporarilySuspendedAccessCode
        .contactUsTimeframe()
        .invoke('text')
        .should('match', /Monday to Friday|9am to 5pm/i);
    });

    it('should have clear heading indicating temporary nature of suspension', () => {
      temporarilySuspendedAccessCode.heading().should('contain', 'temporarily');
    });
  });

  describe('Attempting to bypass suspension', () => {
    beforeEach(() => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/temporarily-suspended-access-code');
    });

    it('should not allow direct navigation to check-your-email while suspended', () => {
      cy.visit('/login/check-your-email-access-code');

      cy.url().should('not.contain', '/login/check-your-email-access-code');
      cy.url().should('eq', relative('/not-found'));
    });

    it('should not allow direct navigation to new-access-code while suspended', () => {
      cy.visit('/login/new-access-code');

      cy.url().should('not.contain', '/login/new-access-code');
      cy.url().should('eq', relative('/not-found'));
    });

    it('should not allow direct navigation to resend-another-access-code while suspended', () => {
      cy.visit('/login/resend-another-access-code');

      cy.url().should('not.contain', '/login/resend-another-access-code');
      cy.url().should('eq', relative('/not-found'));
    });
  });

  describe('Session behavior while suspended', () => {
    it('should maintain partial auth session while suspended', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.getCookie('dtfs-session').should('exist');

      cy.visit('/login/temporarily-suspended-access-code');
      cy.url().should('contain', '/login/temporarily-suspended-access-code');

      cy.getCookie('dtfs-session').should('exist');
    });

    it('should not allow accessing other 2FA pages during suspension', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      const otherPages = ['/login/check-your-email-access-code', '/login/new-access-code', '/login/resend-another-access-code'];

      otherPages.forEach((page) => {
        cy.visit(page);
        cy.url().should('not.contain', page);
      });
    });
  });
});
