const page = {
  home: () => cy.get('[data-cy="header"]').find('.govuk-header__link--homepage'),
  serviceName: () => cy.get('[data-cy="header"]').find('.govuk-header__link--service-name'),
  dashboard: () => cy.get('[data-cy="dashboard"]'),
  users: () => cy.get('[data-cy="users"]'),
};

module.exports = page;
