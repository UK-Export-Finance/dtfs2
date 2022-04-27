const changePassword = {
  // visit: () => cy.visit('/'),
  currentPassword: () => cy.get('[data-cy="current-password"]'),
  currentPasswordError: () => cy.get('#currentPassword-error'),
  password: () => cy.get('[data-cy="password"]'),
  passwordError: () => cy.get('#password-error'),
  confirmPassword: () => cy.get('[data-cy="confirmPassword"]'),
  submit: () => cy.get('[data-cy="submit"]'),
};

module.exports = changePassword;
