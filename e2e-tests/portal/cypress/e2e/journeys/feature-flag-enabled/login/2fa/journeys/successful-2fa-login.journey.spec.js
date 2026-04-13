const { checkYourEmailAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

const authenticatedRoutes = ['/dashboard', '/user/profile'];
const restricted2faRoutes = ['/login/check-your-email-access-code', '/login/new-access-code', '/login/resend-another-access-code'];

const complete2faLogin = () => {
  cy.enterUsernameAndPassword(BANK1_MAKER1);

  cy.url().should('eq', relative('/login/check-your-email-access-code'));

  cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
    cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
    cy.clickSubmitButton();
  });
};

context('2FA Journey - Successful login flow', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: 0 });
  });

  describe('Complete successful 2FA journey', () => {
    it('should redirect to check-your-email page after entering valid credentials', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      cy.assertText(checkYourEmailAccessCode.heading(), 'Check your email');
      checkYourEmailAccessCode.description().should('contain', BANK1_MAKER1.email);
    });

    it('should successfully login and reach the application after entering the correct access code', () => {
      complete2faLogin();

      cy.url().should('not.contain', '/login');
      cy.url().should('match', /\/(dashboard|deals|contracts)/);
    });

    it('should allow access to protected routes after successful 2FA', () => {
      complete2faLogin();

      authenticatedRoutes.forEach((route) => {
        cy.visit(route);
        cy.url().should('contain', route);
      });
    });

    it('should maintain the session after successful 2FA login', () => {
      complete2faLogin();

      cy.getCookie('dtfs-session').should('exist');
      cy.visit('/dashboard');
      cy.url().should('contain', '/dashboard');
    });
  });

  describe('User state after successful login', () => {
    it('should redirect away from 2FA pages after successful login', () => {
      complete2faLogin();

      restricted2faRoutes.forEach((route) => {
        cy.visit(route);
        cy.url().should('not.contain', route);
        cy.url().should('not.contain', '/login');
      });
    });
  });
});
