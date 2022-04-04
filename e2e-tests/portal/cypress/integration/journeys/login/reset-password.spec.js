const { resetPassword, changePassword } = require('../../pages');
const relative = require('../../relativeURL');

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

    // TODO: (DTFS2-5621) re-enable the tests once the user is added back in the mock data loader
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

  context('Change Password screen', () => {
    beforeEach(() => {
      resetPassword.visitChangePassword();
    });

    it('should display password change page', () => {
      changePassword.password().should('exist');
      changePassword.confirmPassword().should('exist');
    });
  });
});
