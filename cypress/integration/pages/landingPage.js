const landingPage = {
  visit: () => cy.visit('/'),
  email: () => cy.get('[data-cy="email"]'),
  password: () => cy.get('[data-cy="password"]'),
  login: () => cy.get('[data-cy="LogIn"]'),
}

module.exports = landingPage;
