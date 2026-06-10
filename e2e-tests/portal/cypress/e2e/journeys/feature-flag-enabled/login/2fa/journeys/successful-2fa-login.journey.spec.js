const { checkYourEmailAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1, BANK1_PAYMENT_REPORT_OFFICER1, BANK1_CHECKER1, ADMINNOMAKER, READ_ONLY } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

const complete2faLogin = (user = BANK1_MAKER1) => {
  cy.enterUsernameAndPassword(user);

  cy.url().should('eq', relative('/login/check-your-email-access-code'));

  cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: user.username }).then(() => {
    cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
    cy.clickSubmitButton();
  });
};

context('2FA Journey - Successful login flow', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('complete successful 2FA journey', () => {
    it('should redirect to check-your-email page after entering valid credentials', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      cy.assertText(checkYourEmailAccessCode.heading(), 'Check your email');
      cy.assertText(checkYourEmailAccessCode.description(), `We have sent you a 6-digit access code to your email ${BANK1_MAKER1.email}.`);
    });

    it('should successfully login and reach the application after entering the correct access code', () => {
      complete2faLogin();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should maintain the session after successful 2FA login', () => {
      complete2faLogin();

      cy.getCookie('dtfs-session').should('exist');
      cy.visit('/dashboard');
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });

  describe('accessing protected routes after successful 2FA', () => {
    beforeEach(() => {
      complete2faLogin();
    });

    it('should allow access to /dashboard after successful 2FA', () => {
      cy.visit('/dashboard');

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should allow access to /user/<user._id> after successful 2FA', () => {
      cy.getUserByUsername(BANK1_MAKER1.username).then((user) => {
        cy.visit(`/user/${user._id}`);

        cy.url().should('eq', relative(`/user/${user._id}`));
      });
    });
  });

  describe('redirecting away from 2FA pages after successful login', () => {
    beforeEach(() => {
      complete2faLogin();
    });

    it('should redirect away from /login/check-your-email-access-code after successful login', () => {
      cy.visit('/login/check-your-email-access-code');

      cy.url().should('not.eq', relative('/login/check-your-email-access-code'));
      cy.url().should('not.eq', relative('/login'));
    });

    it('should redirect away from /login/new-access-code after successful login', () => {
      cy.visit('/login/new-access-code');

      cy.url().should('not.eq', relative('/login/new-access-code'));
      cy.url().should('not.eq', relative('/login'));
    });

    it('should redirect away from /login/resend-another-access-code after successful login', () => {
      cy.visit('/login/resend-another-access-code');

      cy.url().should('not.eq', relative('/login/resend-another-access-code'));
      cy.url().should('not.eq', relative('/login'));
    });
  });

  describe('logging in as a payment report officer with 2FA enabled', () => {
    beforeEach(() => {
      complete2faLogin(BANK1_PAYMENT_REPORT_OFFICER1);
    });

    it('should redirect to the utilisation report upload page after successful login', () => {
      cy.url().should('eq', relative('/utilisation-report-upload'));
    });
  });

  describe('logging in as a checker with 2FA enabled', () => {
    beforeEach(() => {
      complete2faLogin(BANK1_CHECKER1);
    });

    it('should redirect to the default dashboard page after successful login', () => {
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });

  describe('logging in as an admin with 2FA enabled', () => {
    beforeEach(() => {
      complete2faLogin(ADMINNOMAKER);
    });

    it('should redirect to the default dashboard page after successful login', () => {
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });

  describe('logging in as a read-only user with 2FA enabled', () => {
    beforeEach(() => {
      complete2faLogin(READ_ONLY);
    });

    it('should redirect to the default dashboard page after successful login', () => {
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });
});
