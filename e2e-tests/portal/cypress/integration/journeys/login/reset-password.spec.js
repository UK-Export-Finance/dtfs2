const {
  resetPassword, changePassword, header, userProfile,
} = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Password management screens', () => {
  beforeEach(() => {
    resetPassword.visitRequestEmail();
  });

  context('Forgot / Reset password', () => {
    beforeEach(() => {
      resetPassword.visitRequestEmail();
    });

    it('Should have email address input, submit and cancel buttons on the page', () => {
      cy.url().should('eq', relative('/reset-password'));
      resetPassword.emailInput().should('exist');
      resetPassword.submit().should('exist');
      resetPassword.cancel().should('exist');
    });

    it('Enter an empty email address displays error message', () => {
      resetPassword.emailInput().should('be.empty');
      resetPassword.submit().click();

      resetPassword.emailInputError().should('exist');
    });

    it('An non-existant email displays error message', () => {
      resetPassword.emailInput().type('email_is_not_valid@ukexportfinance.gov.uk');
      resetPassword.submit().click();

      cy.url().should('eq', relative('/reset-password?passwordreseterror=1'));

      resetPassword.resetPasswordError().should('exist');
    });

    it('should redirect to login page on successful request for reset password', () => {
      resetPassword.emailInput().type('test_no_notify@ukexportfinance.gov.uk');
      resetPassword.submit().click();

      cy.url().should('eq', relative('/login?passwordreset=1'));
    });

    it('should be case insensitive when accepting email', () => {
      resetPassword.emailInput().type('Test_No_Notify@ukexportfinance.gov.uk');
      resetPassword.submit().click();

      cy.url().should('eq', relative('/login?passwordreset=1'));
    });
  });

  context('Change Password screen', () => {
    it('Should display password set page WITHOUT `current password` field', () => {
      resetPassword.visitChangePassword(); // this redirects to '/reset-password/mockToken'
      changePassword.currentPassword().should('not.exist');
      changePassword.password().should('exist');
      changePassword.confirmPassword().should('exist');
    });

    it('Should display the password change page WITH `current password` field', () => {
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
