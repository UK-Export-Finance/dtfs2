const resetPassword = {
  visitRequestEmail: () => cy.visit('/reset-password'),
  visitChangePassword: () => cy.visit('/reset-password/mockToken'),
  submit: () => cy.get('[data-cy="reset-password-submit"]'),
  cancel: () => cy.get('[data-cy="reset-password-cancel"]'),
  emailInput: () => cy.get('[data-cy="reset-password-email"]'),
  emailInputError: () => cy.get('[data-cy="reset-password-email-error"]'),
  resetPasswordError: () => cy.get('[data-cy="reset-password-error"]'),

};

module.exports = resetPassword;
