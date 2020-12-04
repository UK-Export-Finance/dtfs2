const page = {
  visit: () => cy.visit('/reports/mia_min-cover-start-date-changes'),

  results: () => cy.get('[data-cy="results"]'),
  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
