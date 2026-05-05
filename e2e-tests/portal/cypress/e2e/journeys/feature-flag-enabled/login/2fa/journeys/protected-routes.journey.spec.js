const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

const startPartialAuthJourney = () => {
  cy.enterUsernameAndPassword(BANK1_MAKER1);

  cy.url().should('eq', relative('/login/check-your-email-access-code'));
};

context('2FA Journey - Protected routes authorization', () => {
  describe('User without a session', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
    });

    it('should redirect to login when visiting /dashboard without a session', () => {
      cy.visit('/dashboard');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /user/profile without a session', () => {
      cy.visit('/user/profile');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /contract/12345 without a session', () => {
      cy.visit('/contract/12345');

      cy.url().should('eq', relative('/login'));
    });
  });

  describe('User with partial auth', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      startPartialAuthJourney();
    });

    it('should redirect to login when visiting /dashboard mid-2FA', () => {
      cy.visit('/dashboard');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /user/profile mid-2FA', () => {
      cy.visit('/user/profile');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /contract/12345 mid-2FA', () => {
      cy.visit('/contract/12345');

      cy.url().should('eq', relative('/login'));
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

    it('should successfully access /dashboard after full 2FA', () => {
      cy.visit('/dashboard');

      cy.url().should('contain', '/dashboard');
    });

    it('should successfully access /user/profile after full 2FA', () => {
      cy.visit('/user/profile');

      cy.url().should('contain', '/user/profile');
    });

    it('should redirect away from /login/check-your-email-access-code after full auth', () => {
      cy.visit('/login/check-your-email-access-code');

      cy.url().should('not.contain', '/login/check-your-email-access-code');
      cy.url().should('not.contain', '/login');
    });

    it('should redirect away from /login/new-access-code after full auth', () => {
      cy.visit('/login/new-access-code');

      cy.url().should('not.contain', '/login/new-access-code');
      cy.url().should('not.contain', '/login');
    });
  });
});
