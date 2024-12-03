const login = {
  visit: () => cy.visit('/login'),
  resetPasswordLink: () => cy.get('[data-cy="reset-password"]'),
  banks: () => cy.get('[data-cy="banks"]'),
  products: () => cy.get('[data-cy="products"]'),
  comply: () => cy.get('[data-cy="comply"]'),
  service: () => cy.get('[data-cy="service"]'),
};

module.exports = login;
