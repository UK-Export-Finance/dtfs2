const page = {
  visit: () => cy.visit('/dashboard/transactions'),

  showFilters: () => cy.contains('Show filters'),
  filterByTransactionStage: () => cy.get('[data-cy="filterByTransactionStage"]'),
  filterByTransactionType: () => cy.get('[data-cy="filterByTransactionType"]'),
  search: () => cy.get('[data-cy="search"]'),
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
  stage: () => cy.get('[data-cy="stage"]'),
  type: () => cy.get('[data-cy="type"]'),
  ukefId: () => cy.get('[data-cy="ukefId"]'),
  bankId: () => cy.get('[data-cy="bankSupplyContractID"]'),

  results: () => cy.get('[data-cy="results"]'),
  bankFacilityIDResults: () => cy.get('[data-cy="bankFacilityID"]'),
  ukefFacilityIDResults: () => cy.get('[data-cy="ukefFacilityID"]'),
  facilityTypeResults: () => cy.get('[data-cy="facilityType"]'),
  facilityValueResults: () => cy.get('[data-cy="facilityValue"]'),
  facilityStageResults: () => cy.get('[data-cy="facilityStage"]'),
  facilityIssuedDateResults: () => cy.get('[data-cy="facilityIssuedDate"]'),
  makerResults: () => cy.get('[data-cy="maker"]'),
  checkerResults: () => cy.get('[data-cy="checker"]'),

  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
