const { checkYourEmailAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

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
  });

  describe('Complete successful 2FA journey', () => {
    it('should redirect to check-your-email page after entering valid credentials', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      cy.assertText(checkYourEmailAccessCode.heading(), 'Check your email');
      cy.assertText(checkYourEmailAccessCode.description(), `We have sent you a 6-digit access code to your email ${BANK1_MAKER1.email}.`);
    });

    it('should successfully login and reach the application after entering the correct access code', () => {
      complete2faLogin();

      cy.url().should('not.contain', '/login');
      cy.url().should('match', /\/(dashboard|deals|contracts)/);
    });

    it('should maintain the session after successful 2FA login', () => {
      complete2faLogin();

      cy.getCookie('dtfs-session').should('exist');
      cy.visit('/dashboard');
      cy.url().should('contain', '/dashboard');
    });
  });

  describe('Accessing protected routes after successful 2FA', () => {
    beforeEach(() => {
      complete2faLogin();
    });

    it('should allow access to /dashboard after successful 2FA', () => {
      cy.visit('/dashboard');

      cy.url().should('contain', '/dashboard');
    });

    it('should allow access to /user/profile after successful 2FA', () => {
      cy.visit('/user/profile');

      cy.url().should('contain', '/user/profile');
    });
  });

  describe('Redirecting away from 2FA pages after successful login', () => {
    beforeEach(() => {
      complete2faLogin();
    });

    it('should redirect away from /login/check-your-email-access-code after successful login', () => {
      cy.visit('/login/check-your-email-access-code');

      cy.url().should('not.contain', '/login/check-your-email-access-code');
      cy.url().should('not.contain', '/login');
    });

    it('should redirect away from /login/new-access-code after successful login', () => {
      cy.visit('/login/new-access-code');

      cy.url().should('not.contain', '/login/new-access-code');
      cy.url().should('not.contain', '/login');
    });

    it('should redirect away from /login/resend-another-access-code after successful login', () => {
      cy.visit('/login/resend-another-access-code');

      cy.url().should('not.contain', '/login/resend-another-access-code');
      cy.url().should('not.contain', '/login');
    });
  });
});
