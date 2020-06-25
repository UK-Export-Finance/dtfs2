const page = {
  home: () => cy.get('[data-cy="home"]'),
  dashboard: () => cy.get('[data-cy="dashboard"]'),
  manageUsers: () => cy.get('[data-cy="manageUsers"]'),
};

module.exports = page;
