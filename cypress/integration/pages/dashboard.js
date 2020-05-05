const page = {
  visit: () => cy.visit('/dashboard'),

  showFilters: () => cy.contains('Show filters'),
  filterBySubmissionUser: () => cy.get('[data-cy="filterBySubmissionUser"]'),
  filterBySubmissionType: () => cy.get('[data-cy="filterBySubmissionType"]'),
  filterByStatus: () => cy.get('[data-cy="filterByStatus"]'),
  filterBySupplyContractId: () => cy.get('[data-cy="filterBySupplyContractId"]'),
  filterBySupplierName: () => cy.get('[data-cy="filterBySupplierName"]'),
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
  tableHeaders: {
    bank: () => cy.get('[data-cy="table-header-bank"]'),
  },
  rows: () => cy.get('.govuk-table__body .govuk-table__row'),
  row: (deal) => {
    const row = cy.get(`[data-cy="deal_${deal._id}"]`);
    return {
      bank: () => row.get('[data-cy="bank"]'),
      bankSupplyContractID: () => row.get('[data-cy="bankSupplyContractID"]'),
      bankSupplyContractIDLink: () => row.get('[data-cy="bankSupplyContractIDLink"]'),
      ukefDealId: () => row.get('[data-cy="ukefDealId"]'),
      status: () => row.get('[data-cy="status"]'),
      submissionType: () => row.get('[data-cy="submissionType"]'),
      maker: () => row.get('[data-cy="maker"]'),
      checker: () => row.get('[data-cy="checker"]'),
      updated: () => row.get('[data-cy="updated"]'),
    };
  },
  confirmDealsPresent: (deals) => {
    for (const deal of deals) {
      cy.get(`[data-cy="deal_${deal._id}"]`);
    }
  },

  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
