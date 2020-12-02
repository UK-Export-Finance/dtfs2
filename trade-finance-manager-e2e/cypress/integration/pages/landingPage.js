const landingPage = {
  visit: () => cy.visit('/'),
  email: () => cy.get('[data-cy="email"]'),
  password: () => cy.get('[data-cy="password"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
};

module.exports = landingPage;
