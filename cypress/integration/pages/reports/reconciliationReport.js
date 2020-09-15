const page = {
  visit: () => cy.visit('/reports/audit-supply-contracts'),

  filterByBank: () => cy.get('[data-cy="filterByBank"]'),
  filterByBankSupplyContractId: () => cy.get('[data-cy="filterByBankSupplyContractId"]'),
  filterByUKEFSupplyContractId: () => cy.get('[data-cy="filterByUKEFSupplyContractId"]'),
  filterByStartDate: {
    day: () => cy.get('[data-cy="createdFrom-day"]'),
    month: () => cy.get('[data-cy="createdFrom-month"]'),
    year: () => cy.get('[data-cy="createdFrom-year"]'),
  },
  filterByEndDate: {
    day: () => cy.get('[data-cy="createdTo-day"]'),
    month: () => cy.get('[data-cy="createdTo-month"]'),
    year: () => cy.get('[data-cy="createdTo-year"]'),
  },
  applyFilters: () => cy.get('[data-cy="ApplyFilters"]'),

  // facilityStage: () => cy.get('[data-cy="facilityStage"]'),
  // status: () => cy.get('[data-cy="status"]'),
  bank: () => cy.get('[data-cy="owningBank"]'),
  //
  // results: () => cy.get('[data-cy="results"]'),
  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
