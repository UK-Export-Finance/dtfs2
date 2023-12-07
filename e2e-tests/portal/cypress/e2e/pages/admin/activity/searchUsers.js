const page = {
  visit: () => cy.visit('/admin/activity/search'),

  errorSummary: () => cy.get('[data-cy="error-summary"'),
  searchTermError: () => cy.get('[data-cy="search-term-error"'),
  searchBar: () => cy.get('[data-cy="users-search-bar"'),
  findUsersButton: () => cy.get('[data-cy="find-users-button"]'),
};

module.exports = page;
