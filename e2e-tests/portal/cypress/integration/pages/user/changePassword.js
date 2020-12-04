const changePassword = {
  // visit: () => cy.visit('/'),
  password: () => cy.get('[data-cy="password"]'),
  passwordError: () => cy.get(`#password-error`),
  confirmPassword: () => cy.get('[data-cy="confirmPassword"]'),
  submit: () => cy.get('[data-cy="submit"]'),
}

module.exports = changePassword;
