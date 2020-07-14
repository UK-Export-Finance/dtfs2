const page = {
  home: () => cy.get('[data-cy="home"]'),
  serviceName: () => cy.get('[data-cy="service-name"]'),
  dashboard: () => cy.get('[data-cy="dashboard"]'),
  manageUsers: () => cy.get('[data-cy="manageUsers"]'),
};

module.exports = page;
