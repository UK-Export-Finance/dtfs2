const mockToken = 'ABCDEF0123456789';

const resetPassword = {
  visitRequestEmail: () => cy.visit('/reset-password'),
  visitChangePassword: (resetPwdToken = mockToken) => cy.visit(`/reset-password/${resetPwdToken}`),
  submit: () => cy.get('[data-cy="reset-password-submit"]'),
  cancel: () => cy.get('[data-cy="reset-password-cancel"]'),
  emailInput: () => cy.get('[data-cy="reset-password-email"]'),
  emailInputError: () => cy.get('[data-cy="reset-password-email-error"]'),
  resetPasswordError: () => cy.get('[data-cy="reset-password-error"]'),
};

module.exports = resetPassword;
