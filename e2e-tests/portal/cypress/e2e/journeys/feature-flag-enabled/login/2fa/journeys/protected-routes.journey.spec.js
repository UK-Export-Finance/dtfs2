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

    it('should redirect to login when visiting /user/<user._id> without a session', () => {
      cy.getUserByUsername(BANK1_MAKER1.username).then((user) => {
        cy.visit(`/user/${user._id}`);

        cy.url().should('eq', relative('/login'));
      });
    });

    it('should redirect to login when visiting /contract/12345 without a session', () => {
      cy.visit('/contract/12345');

      cy.url().should('eq', relative('/login'));
    });
  });

  /**
   * When a user is mid-2FA (partial auth) and visits a protected route, the
   * partial-auth session is destroyed server-side and the user is sent back to /login.
   */
  describe('User with partial auth', () => {
    beforeEach(() => {
      commonBeforeEach(BANK1_MAKER1, { login: false });
      startPartialAuthJourney();
    });

    it('should redirect to login when visiting /dashboard mid-2FA', () => {
      cy.visit('/dashboard');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when visiting /user/<user._id> mid-2FA', () => {
      cy.getUserByUsername(BANK1_MAKER1.username).then((user) => {
        cy.visit(`/user/${user._id}`);

        cy.url().should('eq', relative('/login'));
      });
    });

    it('should redirect to login when visiting /contract/12345 mid-2FA', () => {
      cy.visit('/contract/12345');

      cy.url().should('eq', relative('/login'));
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

    it('should successfully access /user/<user._id> after full 2FA', () => {
      cy.getUserByUsername(BANK1_MAKER1.username).then((user) => {
        cy.visit(`/user/${user._id}`);

        cy.url().should('contain', `/user/${user._id}`);
      });
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
