const page = {
  visit: () => cy.visit('/reports'),

  reports: () => cy.get('[data-cy="report-links"]'),
  subNavigation: () => cy.get('.moj-sub-navigation'),
};

module.exports = page;
