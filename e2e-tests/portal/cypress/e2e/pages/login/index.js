const login = {
  visit: () => cy.visit('/login'),
  resetPasswordLink: () => cy.get('[data-cy="reset-password"]'),
};

module.exports = login;
