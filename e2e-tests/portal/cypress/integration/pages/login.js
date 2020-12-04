const login = {
  visit: () => cy.visit('/'),
  resetPasswordLink: () => cy.get('[data-cy="reset-password"]'),
};

module.exports = login;
