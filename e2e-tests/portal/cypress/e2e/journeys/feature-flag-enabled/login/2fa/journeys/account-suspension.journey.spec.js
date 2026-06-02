const { temporarilySuspendedAccessCode, checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

context('Portal 2FA Journey - Account suspension - too many access-code resend/request attempts are made', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('when handling partial auth session', () => {
    it('should render the suspension page when accessed directly without a partial auth session', () => {
      temporarilySuspendedAccessCode.visit();

      cy.url().should('contain', '/login/temporarily-suspended-access-code');
      cy.assertText(temporarilySuspendedAccessCode.heading(), 'This account has been temporarily suspended');
    });

    it('should keep the partial auth session while suspended', () => {
      cy.goToSuspendedPage(BANK1_MAKER1);

      cy.getCookie('dtfs-session').should('exist');
      cy.visit('/login/temporarily-suspended-access-code');
      cy.url().should('contain', '/login/temporarily-suspended-access-code');
      cy.getCookie('dtfs-session').should('exist');
    });
  });

  describe('when a suspended user re-submits the login form', () => {
    beforeEach(() => {
      cy.task('updatePortalUserByUsername', {
        username: BANK1_MAKER1.username,
        update: { 'user-status': 'blocked' },
      });

      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should redirect to the suspended account page instead of silently returning to /login', () => {
      cy.url().should('contain', '/login/temporarily-suspended-access-code');
    });

    it('should display the suspension heading and message on re-submission', () => {
      cy.assertText(temporarilySuspendedAccessCode.heading(), 'This account has been temporarily suspended');
      cy.assertText(
        temporarilySuspendedAccessCode.message(),
        'This can happen if there are too many failed attempts to login or sign in link requests. Check your email for details on how to regain access.',
      );
    });
  });

  describe('when reaching the suspension page', () => {
    it('should show contact information on the suspension page', () => {
      cy.goToSuspendedPage(BANK1_MAKER1);

      temporarilySuspendedAccessCode
        .contactUsEmail()
        .should('have.attr', 'href')
        .and('match', /^mailto:/);
      cy.assertText(temporarilySuspendedAccessCode.contactUsTimeframe(), 'Monday to Friday, 9am to 5pm (excluding public holidays)');
    });
  });

  describe('when progressing through resend states before suspension', () => {
    beforeEach(() => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should show the relevant text on the check-your-email-access-code page', () => {
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      cy.assertText(checkYourEmailAccessCode.attemptsInfo(), 'You have 2 attempts remaining.');
    });

    it('should show the relevant text on the new-access-code page after requesting a new code', () => {
      checkYourEmailAccessCode.requestCodeLink().click();

      cy.url().should('contain', '/login/new-access-code');
      cy.assertText(newAccessCode.attemptsInfo(), 'You have 1 attempts remaining.');
    });

    it('should show "You have 0 attempts remaining." on resend-another-access-code page after requesting another code', () => {
      checkYourEmailAccessCode.requestCodeLink().click();
      newAccessCode.requestCodeLink().click();

      cy.url().should('contain', '/login/resend-another-access-code');
      cy.assertText(resendAnotherAccessCode.attemptsInfo(), 'You have 0 attempts remaining.');
    });

    describe('when suspension is triggered after exhausting resend attempts', () => {
      beforeEach(() => {
        cy.goToSuspendedPage(BANK1_MAKER1);
      });

      it('should reach the suspension page after exhausting all resend attempts', () => {
        cy.url().should('contain', '/login/temporarily-suspended-access-code');
      });

      it('should display the suspension heading', () => {
        cy.assertText(temporarilySuspendedAccessCode.heading(), 'This account has been temporarily suspended');
      });

      it('should display the suspension message', () => {
        cy.assertText(
          temporarilySuspendedAccessCode.message(),
          'This can happen if there are too many failed attempts to login or sign in link requests. Check your email for details on how to regain access.',
        );
      });
    });
  });
});
