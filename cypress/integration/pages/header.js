const page = {
  home: () => cy.get('[data-cy="header"]').find('.govuk-header__link--homepage'),
  serviceName: () => cy.get('[data-cy="header"]').find('.govuk-header__link--service-name'),
  dashboard: () => cy.get('[data-cy="dashboard"]'),
  manageUsers: () => cy.get('[data-cy="manageUsers"]'),
};

module.exports = page;
