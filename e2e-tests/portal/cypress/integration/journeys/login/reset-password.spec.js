const { resetPassword, changePassword } = require('../../pages');
const relative = require('../../relativeURL');

context('Reset password', () => {
  beforeEach(() => {
    // [ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

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

    it('should be case insensitive when accepting email', () => {
      resetPassword.emailInput().type('Test_No_Notify@ukexportfinance.gov.uk');
      resetPassword.submit().click();

      cy.url().should('eq', relative('/login?passwordreset=1'));
    });
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
