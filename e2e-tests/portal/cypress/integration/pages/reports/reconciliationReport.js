const page = {
  visit: () => cy.visit('/reports/reconciliation-report'),

  filterByBank: () => cy.get('[data-cy="filterByBank"]'),
  filterBybankInternalRefName: () => cy.get('[data-cy="filterBybankInternalRefName"]'),
  filterByUKEFSupplyContractId: () => cy.get('[data-cy="filterByUKEFSupplyContractId"]'),
  filterByStartDate: {
    day: () => cy.get('[data-cy="submittedFrom-day"]'),
    month: () => cy.get('[data-cy="submittedFrom-month"]'),
    year: () => cy.get('[data-cy="submittedFrom-year"]'),
  },
  filterByEndDate: {
    day: () => cy.get('[data-cy="submittedTo-day"]'),
    month: () => cy.get('[data-cy="submittedTo-month"]'),
    year: () => cy.get('[data-cy="submittedTo-year"]'),
  },
  applyFilters: () => cy.get('[data-cy="ApplyFilters"]'),

  bank: () => cy.get('[data-cy="bank"]'),
  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
