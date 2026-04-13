const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

const blockedRoutes = ['/dashboard', '/user/profile', '/contract/12345'];
const authenticatedRoutes = ['/dashboard', '/user/profile'];
const restricted2faRoutes = ['/login/check-your-email-access-code', '/login/new-access-code'];

const startPartialAuthJourney = () => {
  cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: 0 });
  cy.enterUsernameAndPassword(BANK1_MAKER1);

  cy.url().should('eq', relative('/login/check-your-email-access-code'));
};

context('2FA Journey - Protected routes authorization', () => {
  describe('User without a session', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
    });

    blockedRoutes.forEach((route) => {
      it(`should redirect to login when visiting ${route} without a session`, () => {
        cy.visit(route);
        cy.url().should('eq', relative('/login'));
      });
    });
  });

  describe('User with partial auth', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      startPartialAuthJourney();
    });

    blockedRoutes.forEach((route) => {
      it(`should redirect to login when visiting ${route} mid-2FA`, () => {
        cy.visit(route);
        cy.url().should('eq', relative('/login'));
      });
    });

    it('should keep the partial auth session after a protected route redirect', () => {
      cy.visit('/dashboard');
      cy.url().should('eq', relative('/login'));

      cy.getCookie('dtfs-session').should('exist');
    });

    it('should allow the current 2FA page to be revisited during partial auth', () => {
      cy.visit('/login/check-your-email-access-code');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });
  });

  describe('Fully authenticated user', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      cy.loginOTP(BANK1_MAKER1);
    });

    authenticatedRoutes.forEach((route) => {
      it(`should successfully access ${route} after full 2FA`, () => {
        cy.visit(route);
        cy.url().should('contain', route);
      });
    });

    it('should redirect away from 2FA pages after full auth', () => {
      restricted2faRoutes.forEach((route) => {
        cy.visit(route);
        cy.url().should('not.contain', route);
        cy.url().should('not.contain', '/login');
      });
    });
  });
});
