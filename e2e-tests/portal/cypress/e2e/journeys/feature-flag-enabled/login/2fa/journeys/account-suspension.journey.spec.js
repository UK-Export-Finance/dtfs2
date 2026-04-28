const { temporarilySuspendedAccessCode, checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

context('Portal 2FA Journey - Account suspension - too many attempts to login are made', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('when handling partial auth session', () => {
    it('should redirect to login when accessing the suspension page without partial auth', () => {
      temporarilySuspendedAccessCode.visit();

      cy.url().should('eq', relative('/login'));
    });

    it('should keep the partial auth session while suspended', () => {
      cy.goToSuspendedPage(BANK1_MAKER1.username);

      cy.getCookie('dtfs-session').should('exist');
      cy.visit('/login/temporarily-suspended-access-code');
      cy.url().should('contain', '/login/temporarily-suspended-access-code');
      cy.getCookie('dtfs-session').should('exist');
    });
  });

  describe('when reaching the suspension page', () => {
    it('should show contact information on the suspension page', () => {
      cy.goToSuspendedPage(BANK1_MAKER1.username);

      temporarilySuspendedAccessCode
        .contactUsEmail()
        .should('have.attr', 'href')
        .and('match', /^mailto:/);
      cy.assertText(temporarilySuspendedAccessCode.contactUsTimeframe(), 'Monday to Friday, 9am to 5pm (excluding public holidays)');
    });
  });

  describe('when progressing through resend states before suspension', () => {
    it('should show "You have 2 attempts remaining." on check-your-email-access-code page', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      cy.assertText(checkYourEmailAccessCode.attemptsInfo(), 'You have 2 attempts remaining.');
    });

    it('should show "You have 1 attempts remaining." on new-access-code page after requesting a new code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      checkYourEmailAccessCode.requestCodeLink().click();

      cy.url().should('contain', '/login/new-access-code');
      cy.assertText(newAccessCode.attemptsInfo(), 'You have 1 attempts remaining.');
    });

    it('should show "You have 0 attempts remaining." on resend-another-access-code page after requesting another code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      checkYourEmailAccessCode.requestCodeLink().click();
      newAccessCode.requestCodeLink().click();

      cy.url().should('contain', '/login/resend-another-access-code');
      cy.assertText(resendAnotherAccessCode.attemptsInfo(), 'You have 0 attempts remaining.');
    });

    it('should reach the suspension page after exhausting all resend attempts', () => {
      cy.goToSuspendedPage(BANK1_MAKER1.username);

      cy.url().should('contain', '/login/temporarily-suspended-access-code');
    });

    it('should display the suspension heading', () => {
      cy.goToSuspendedPage(BANK1_MAKER1.username);

      cy.assertText(temporarilySuspendedAccessCode.heading(), 'This account has been temporarily suspended');
    });

    it('should display the suspension message', () => {
      cy.goToSuspendedPage(BANK1_MAKER1.username);

      cy.assertText(
        temporarilySuspendedAccessCode.message(),
        'This can happen if there are too many failed attempts to login or sign in link requests. Check your email for details on how to regain access.',
      );
    });
  });

  describe('when attempting to access protected routes while suspended', () => {
    beforeEach(() => {
      cy.goToSuspendedPage(BANK1_MAKER1.username);
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
      cy.goToSuspendedPage(BANK1_MAKER1.username);
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
