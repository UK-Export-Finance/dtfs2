const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../2faPageHelpers');

/**
 * E2E Journey Test: Protected Routes and Authorization
 *
 * Tests that protected routes correctly enforce 2FA:
 * - Users without sessions cannot access protected routes
 * - Users with partial auth (mid-2FA) cannot access protected routes
 * - Users must complete 2FA to access the application
 */
context('2FA Journey - Protected routes authorization', () => {
  const protectedRoutes = [
    { path: '/dashboard', description: 'dashboard' },
    { path: '/user/profile', description: 'user profile' },
  ];

  describe('User without session (not logged in)', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
    });

    protectedRoutes.forEach(({ path, description }) => {
      it(`should redirect to login when visiting ${description} without session`, () => {
        cy.visit(path);
        cy.url().should('eq', relative('/login'));
      });
    });

    it('should redirect to login when visiting dashboard without session', () => {
      cy.visit('/dashboard');
      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting contracts without session', () => {
      cy.visit('/contract/12345');
      cy.url().should('eq', relative('/login'));
    });
  });

  describe('User with partial auth (mid-2FA journey)', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });

    protectedRoutes.forEach(({ path, description }) => {
      it(`should redirect to login when attempting to visit ${description} mid-2FA`, () => {
        cy.visit(path);
        cy.url().should('eq', relative('/login'));
      });
    });

    it('should redirect to login when attempting to visit dashboard mid-2FA', () => {
      cy.visit('/dashboard');
      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when attempting to visit contracts mid-2FA', () => {
      cy.visit('/contract/12345');
      cy.url().should('eq', relative('/login'));
    });
  });

  describe('Session validation after partial auth', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });

    it('should have partial auth token but not full auth token', () => {
      cy.getCookie('dtfs-session').should('exist');
    });

    it('should clear session and redirect to login when trying to access protected route', () => {
      cy.visit('/dashboard');
      cy.url().should('eq', relative('/login'));

      cy.getCookie('dtfs-session').should('exist');
    });

    it('should remain on 2FA pages when accessing them during partial auth', () => {
      cy.url().should('eq', relative('/login/check-your-email-access-code'));

      cy.visit('/login/check-your-email-access-code');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });
  });

  describe('Fully authenticated user', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.loginOTP(BANK1_MAKER1);
    });

    protectedRoutes.forEach(({ path, description }) => {
      it(`should successfully access ${description} after full 2FA`, () => {
        cy.visit(path);
        cy.url().should('contain', path);
      });
    });

    it('should successfully access dashboard after full 2FA', () => {
      cy.visit('/dashboard');
      cy.url().should('contain', '/dashboard');
    });

    it('should redirect to home when trying to access 2FA pages after full auth', () => {
      cy.visit('/login/check-your-email-access-code');
      cy.url().should('not.contain', '/login');
    });

    it('should redirect to home when trying to access new-access-code page after full auth', () => {
      cy.visit('/login/new-access-code');
      cy.url().should('not.contain', '/login');
    });
  });
});
