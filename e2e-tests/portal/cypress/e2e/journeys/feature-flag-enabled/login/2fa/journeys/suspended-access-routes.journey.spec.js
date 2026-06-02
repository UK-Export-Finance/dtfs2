const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

context('Portal 2FA Journey - Suspended access routes', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('when attempting to access protected routes while suspended', () => {
    beforeEach(() => {
      cy.goToSuspendedPage(BANK1_MAKER1);
    });

    it('should redirect to login when attempting to access /dashboard', () => {
      cy.visit('/dashboard');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when attempting to access /user/profile', () => {
      cy.visit('/user/profile');

      cy.url().should('eq', relative('/login'));
    });

    it('should redirect to login when attempting to access /contract/12345', () => {
      cy.visit('/contract/12345');

      cy.url().should('eq', relative('/login'));
    });
  });

  describe('when attempting to directly access 2FA routes while suspended', () => {
    beforeEach(() => {
      cy.goToSuspendedPage(BANK1_MAKER1);
    });

    it('should not allow bypassing suspension by visiting /login/check-your-email-access-code', () => {
      cy.visit('/login/check-your-email-access-code');

      cy.url().should('eq', relative('/not-found'));
    });

    it('should not allow bypassing suspension by visiting /login/new-access-code', () => {
      cy.visit('/login/new-access-code');

      cy.url().should('eq', relative('/not-found'));
    });

    it('should not allow bypassing suspension by visiting /login/resend-another-access-code', () => {
      cy.visit('/login/resend-another-access-code');

      cy.url().should('eq', relative('/not-found'));
    });
  });
});
