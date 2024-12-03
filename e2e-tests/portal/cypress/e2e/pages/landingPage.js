const landingPage = {
  visit: () => cy.visit('/login'),
  email: () => cy.get('[data-cy="email"]'),
  password: () => cy.get('[data-cy="password"]'),
  login: () => cy.get('[data-cy="LogIn"]'),
  emailError: (text) => cy.get('[data-cy="email-error"]').contains(text),
  passwordError: (text) => cy.get('[data-cy="password-error"]').contains(text),
  expectError: (text) => cy.get('[data-cy="error-summary"]').contains(text),
  accountSuspended: () => cy.get('[data-cy="account-suspended"]'),
};

module.exports = landingPage;
