const page = {
  home: () => cy.get('[data-cy="header"]').find('.govuk-header__link--homepage'),
  serviceName: () => cy.get('[data-cy="header"]').find('.govuk-header__link--service-name'),
  dashboard: () => cy.get('[data-cy="dashboard"]'),
  reports: () => cy.get('[data-cy="reports"]'),
  users: () => cy.get('[data-cy="users"]'),


  profile: () => cy.get('.govuk-header__link').contains('Profile'),
  logOut: () => cy.get('.govuk-header__link').contains('Sign out'),
};

module.exports = page;
