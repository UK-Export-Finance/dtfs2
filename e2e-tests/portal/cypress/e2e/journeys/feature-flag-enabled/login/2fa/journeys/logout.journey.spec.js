const { header } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

context('2FA Journey - Logout', () => {
  describe('Logout from authenticated session', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.loginOTP(BANK1_MAKER1);
      cy.visit('/dashboard');

      cy.url().should('contain', '/dashboard');
    });

    it('should display logout link when user is authenticated', () => {
      header.logout().should('exist');
      header.logout().should('be.visible');
    });

    it('should redirect to login page when logout link is clicked', () => {
      header.logout().click();

      cy.url().should('eq', relative('/login'));
    });

    it('should invalidate the session after logout', () => {
      cy.getCookie('dtfs-session').should('exist');

      header.logout().click();

      cy.url().should('eq', relative('/login'));

      // Verify the session is invalidated by attempting to access a protected route
      cy.visit('/dashboard');
      cy.url().should('eq', relative('/login'));
    });
  });

  describe('Protected routes after logout', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.loginOTP(BANK1_MAKER1);
      cy.visit('/dashboard');

      cy.url().should('contain', '/dashboard');
      header.logout().click();

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /dashboard after logout', () => {
      cy.visit('/dashboard');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /user/profile after logout', () => {
      cy.visit('/user/profile');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /dashboard/deals/0 after logout', () => {
      cy.visit('/dashboard/deals/0');

      cy.url().should('eq', relative('/login'));
    });
  });

  describe('2FA routes after logout', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.loginOTP(BANK1_MAKER1);
      cy.visit('/dashboard');

      header.logout().click();

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /login/check-your-email-access-code after logout', () => {
      cy.visit('/login/check-your-email-access-code');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /login/new-access-code after logout', () => {
      cy.visit('/login/new-access-code');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /login/resend-another-access-code after logout', () => {
      cy.visit('/login/resend-another-access-code');

      cy.url().should('eq', relative('/login'));
    });
  });

  describe('Session state after logout', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.loginOTP(BANK1_MAKER1);
    });

    it('should require full re-authentication after logout', () => {
      cy.visit('/dashboard');
      cy.url().should('contain', '/dashboard');

      header.logout().click();

      cy.url().should('eq', relative('/login'));

      // Session is invalidated - protected routes redirect to login
      cy.visit('/dashboard');

      cy.url().should('eq', relative('/login'));
    });

    it('should not restore the previous session when navigating back after logout', () => {
      cy.visit('/dashboard');
      cy.url().should('contain', '/dashboard');

      header.logout().click();

      cy.url().should('eq', relative('/login'));

      cy.go('back');

      cy.url().should('eq', relative('/login'));
    });
  });

  describe('Multiple logout attempts', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.loginOTP(BANK1_MAKER1);
      cy.visit('/dashboard');
    });

    it('should handle visiting logout URL directly when already logged out', () => {
      header.logout().click();

      cy.url().should('eq', relative('/login'));

      cy.visit('/logout');

      cy.url().should('eq', relative('/login'));
    });
  });
});
