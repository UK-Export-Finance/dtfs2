const page = {
  home: () => cy.get('[data-cy="home"]'),
  dashboard: () => cy.get('[data-cy="dashboard"]'),
};

module.exports = page;
