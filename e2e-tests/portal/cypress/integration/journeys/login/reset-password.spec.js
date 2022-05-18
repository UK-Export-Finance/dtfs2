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
      resetPassword.emailInputError().contains('Enter an email address in the correct format, for example, name@example.com');
    });

    it('A non-existant email displays error message', () => {
      resetPassword.emailInput().type('email_is_not_valid@ukexportfinance.gov.uk');
      resetPassword.submit().click();

      cy.url().should('eq', relative('/reset-password?passwordreseterror=1'));
      resetPassword.resetPasswordError().should('exist');
      resetPassword.resetPasswordError().contains('There was a problem resetting the password. Please try again.');
    });

    // TODO: re-enable the tests once the user is added back in the mock data loader
    // it('should redirect to login page on successful request for reset password', () => {
    //   resetPassword.emailInput().type('test_no_notify@ukexportfinance.gov.uk');
    //   resetPassword.submit().click();

    //   cy.url().should('eq', relative('/login?passwordreset=1'));
    // });

    // it('should be case insensitive when accepting email', () => {
    //   resetPassword.emailInput().type('Test_No_Notify@ukexportfinance.gov.uk');
    //   resetPassword.submit().click();

    //   cy.url().should('eq', relative('/login?passwordreset=1'));
    // });
  });

  context('Set password - reset password email', () => {
    it('Should display set password page WITHOUT `current password` field with available buttons', () => {
      resetPassword.visitChangePassword(); // this redirects to '/reset-password/mockToken'

      changePassword.currentPassword().should('not.exist');
      changePassword.password().should('exist');
      changePassword.confirmPassword().should('exist');
      changePassword.submit().should('exist');
      changePassword.cancel().should('exist');
    });

    it('Should display error message on an empty new password field submit', () => {
      resetPassword.visitChangePassword();
      changePassword.submit().click();

      changePassword.passwordError().should('exist');
      changePassword.passwordError().contains('Empty password');
    });

    it('Should display error message on an empty confirm new password field submit', () => {
      resetPassword.visitChangePassword();
      changePassword.password().type('abc');
      changePassword.submit().click();

      changePassword.passwordConfirmError().should('exist');
      changePassword.passwordConfirmError().contains('Empty password');
    });
  });

  context('User change their own password', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);
      cy.url().should('eq', relative('/dashboard/deals/0'));
      header.profile().click();
      userProfile.changePassword().click();
      cy.url().should('include', '/change-password');
    });

    it('Should display all three password fields alongside respective buttons', () => {
      changePassword.currentPassword().should('exist');
      changePassword.password().should('exist');
      changePassword.confirmPassword().should('exist');
      changePassword.submit().should('exist');
      changePassword.cancel().should('exist');
    });

    it('Should display error messages upon empty field submission', () => {
      changePassword.submit().click();
      cy.url().should('include', '/change-password');

      changePassword.currentPasswordError().should('exist');
      changePassword.currentPasswordError().contains('Current password is not correct.');
      changePassword.passwordError().should('exist');
      changePassword.passwordError().contains('Password is not correct.');
      changePassword.passwordConfirmError().should('exist');
      changePassword.passwordConfirmError().contains('Confirm password is not correct.');
    });
  });
});
