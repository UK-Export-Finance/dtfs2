const { temporarilySuspendedAccessCode, checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

const blockedRoutes = ['/dashboard', '/user/profile', '/contract/12345'];
const blocked2faRoutes = ['/login/check-your-email-access-code', '/login/new-access-code', '/login/resend-another-access-code'];

const goToSuspendedPage = () => {
  cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: 3 });
  cy.enterUsernameAndPassword(BANK1_MAKER1);

  cy.url().should('contain', '/login/temporarily-suspended-access-code');
};

context('2FA Journey - Account suspension after too many attempts', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should redirect to login when accessing the suspension page without partial auth', () => {
    temporarilySuspendedAccessCode.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('should redirect to the suspension page after exhausting all resend attempts', () => {
    goToSuspendedPage();

    cy.assertText(temporarilySuspendedAccessCode.heading(), 'This account has been temporarily suspended');
    cy.assertText(
      temporarilySuspendedAccessCode.message(),
      'This can happen if there are too many failed attempts to login or sign in link requests. Check your email for details on how to regain access.',
    );
  });

  it('should show contact information on the suspension page', () => {
    goToSuspendedPage();

    temporarilySuspendedAccessCode
      .contactUsEmail()
      .should('have.attr', 'href')
      .and('match', /^mailto:/);
    cy.assertText(temporarilySuspendedAccessCode.contactUsTimeframe(), 'Monday to Friday, 9am to 5pm (excluding public holidays)');
  });

  it('should progress through each resend state before suspension', () => {
    cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: 0 });
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    cy.url().should('eq', relative('/login/check-your-email-access-code'));
    cy.assertText(checkYourEmailAccessCode.attemptsInfo(), 'You have 2 attempts remaining.');

    cy.resetPortalUserStatusAndNumberOfSignInOTPs(BANK1_MAKER1.username);
    cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: 1 });
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    cy.url().should('contain', '/login/new-access-code');
    cy.assertText(newAccessCode.attemptsInfo(), 'You have 1 attempts remaining.');

    cy.resetPortalUserStatusAndNumberOfSignInOTPs(BANK1_MAKER1.username);
    cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count: 2 });
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    cy.url().should('contain', '/login/resend-another-access-code');
    cy.assertText(resendAnotherAccessCode.attemptsInfo(), 'You have 0 attempts remaining.');

    cy.resetPortalUserStatusAndNumberOfSignInOTPs(BANK1_MAKER1.username);
    goToSuspendedPage();
  });

  blockedRoutes.forEach((route) => {
    it(`should redirect to login when attempting to access ${route} while suspended`, () => {
      goToSuspendedPage();
      cy.visit(route);

      cy.url().should('eq', relative('/login'));
    });
  });

  blocked2faRoutes.forEach((route) => {
    it(`should not allow bypassing suspension by visiting ${route}`, () => {
      goToSuspendedPage();
      cy.visit(route);

      cy.url().should('eq', relative('/not-found'));
    });
  });

  it('should keep the partial auth session while suspended', () => {
    goToSuspendedPage();

    cy.getCookie('dtfs-session').should('exist');
    cy.visit('/login/temporarily-suspended-access-code');
    cy.url().should('contain', '/login/temporarily-suspended-access-code');
    cy.getCookie('dtfs-session').should('exist');
  });
});
