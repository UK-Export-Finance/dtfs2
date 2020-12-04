const page = {
  visit: () => cy.visit('/reports/audit-transactions'),

  filterByBank: () => cy.get('[data-cy="filterByBank"]'),
  filterByFacilityStage: () => cy.get('[data-cy="filterByFacilityStage"]'),
  filterBySupplierName: () => cy.get('[data-cy="filterBySupplierName"]'),
  filterByBankSupplyContractId: () => cy.get('[data-cy="filterByBankSupplyContractId"]'),
  filterByUKEFSupplyContractId: () => cy.get('[data-cy="filterByUKEFSupplyContractId"]'),
  // filterByTransactionType: () => cy.get('[data-cy="filterByTransactionType"]'),
  // search: () => cy.get('[data-cy="search"]'),
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
  facilityStage: () => cy.get('[data-cy="facilityStage"]'),
  // type: () => cy.get('[data-cy="type"]'),
  // ukefId: () => cy.get('[data-cy="ukefId"]'),
  // bankId: () => cy.get('[data-cy="bankSupplyContractID"]'),

  results: () => cy.get('[data-cy="results"]'),
  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
