const page = {
  visit: () => cy.visit('/dashboard/deals/0'),

  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),

  createdByYouCheckbox: () => cy.get('[data-cy="created-by-you-checkbox"]'),

  showFilters: () => cy.contains('Show filters'),
  tableHeader: (column) => cy.get(`[data-cy="deal__header--${column}"]`),
  rows: () => cy.get('.govuk-table__body .govuk-table__row'),
  row: {
    exporter: (id) => cy.get(`[data-cy="deal__exporter--${id}"]`),
    bankRef: (id) => cy.get(`[data-cy="deal__bankRef--bankInternalRefName${id}"]`),
    link: (id) => cy.get(`[data-cy="deal__link--${id}"]`),
    product: (id) => cy.get(`[data-cy="deal__product--${id}"]`),
    status: (id) => cy.get(`[data-cy="deal__status--${id}"]`),
    type: (id) => cy.get(`[data-cy="deal__submissionType--${id}"]`),
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
