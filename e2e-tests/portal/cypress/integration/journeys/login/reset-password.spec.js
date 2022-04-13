const {
  resetPassword, changePassword, header, userProfile,
} = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Reset password', () => {
  beforeEach(() => {
    resetPassword.visitRequestEmail();
  });

  context('Request password', () => {
    beforeEach(() => {
      resetPassword.visitRequestEmail();
    });

    it('An incorrect email displays error message', () => {
      resetPassword.emailInput().type('aaa');
      resetPassword.submit().click();

      cy.url().should('eq', relative('/reset-password?passwordreseterror=1'));

      resetPassword.resetPasswordError().should('exist');
    });

    it('should redirect to login page on successful request for reset password', () => {
      resetPassword.emailInput().type('test_no_notify@ukexportfinance.gov.uk');
      resetPassword.submit().click();

      cy.url().should('eq', relative('/login?passwordreset=1'));
    });
  });

  context('Change Password screen', () => {
    it('should display password change page WITHOUT `current password` field', () => {
      resetPassword.visitChangePassword(); // this redirects to '/reset-password/mockToken'
      // the `current password` should NOT exist if the user is not logged in
      // this is because the page contains a token
      changePassword.currentPassword().should('not.exist');
      changePassword.password().should('exist');
      changePassword.confirmPassword().should('exist');
    });

    it('should display the password change page WITH `current password` field', () => {
      cy.login(BANK1_MAKER1);
      cy.url().should('eq', relative('/dashboard/deals/0'));
      header.profile().click();
      userProfile.changePassword().click();

      changePassword.currentPassword().should('exist');
      changePassword.password().should('exist');
      changePassword.confirmPassword().should('exist');
    });
  });
});
