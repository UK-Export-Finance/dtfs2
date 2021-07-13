const page = {
  visit: () => cy.visit('/dashboard'),

  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),

  showFilters: () => cy.contains('Show filters'),
  filterBySubmissionUser: () => cy.get('[data-cy="filterBySubmissionUser"]'),
  filterBySubmissionType: () => cy.get('[data-cy="filterBySubmissionType"]'),
  filterByShowAbandonedDeals_no: () => cy.get('[data-cy="filterByShowAbandonedDeals-false"]'),
  filterByShowAbandonedDeals_yes: () => cy.get('[data-cy="filterByShowAbandonedDeals-true"]'),
  filterByStatus: () => cy.get('[data-cy="filterByStatus"]'),
  filterSearch: () => cy.get('[data-cy="filterSearch"]'),
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
  tableHeader: (column) => cy.get(`[data-cy="deal__header--${column}"]`),
  rows: () => cy.get('.govuk-table__body .govuk-table__row'),
  row: {
    exporter: (id) => cy.get(`[data-cy="deal__exporter--${id}"]`),
    bankRef: (id) => cy.get(`[data-cy="deal__bankRef--${id}"]`),
    link: (id) => cy.get(`[data-cy="deal__link--${id}"]`),
    product: (id) => cy.get(`[data-cy="deal__product--${id}"]`),
    status: (id) => cy.get(`[data-cy="deal__status--${id}"]`),
    type: (id) => cy.get(`[data-cy="deal__type--${id}"]`),
    updated: (id) => cy.get(`[data-cy="deal__updated--${id}"]`),
  },
  confirmDealsPresent: (deals) => {
    deals.forEach((deal) => {
      cy.get(`[data-cy="deal__exporter--${deal._id}"]`);
    });
  },

  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
