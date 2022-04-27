const resetPassword = {
  visitRequestEmail: () => cy.visit('/reset-password'),
  visitChangePassword: () => cy.visit('/reset-password/mockToken'),
  submit: () => cy.get('[data-cy="reset-password-submit"]'),
  emailInput: () => cy.get('[data-cy="email"]'),
  resetPasswordError: () => cy.get('[data-cy="reset-password-error"]'),

};

module.exports = resetPassword;
