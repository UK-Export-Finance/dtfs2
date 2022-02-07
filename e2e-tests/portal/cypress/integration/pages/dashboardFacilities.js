const page = {
  visit: () => cy.visit('/dashboard/facilities'),
  rows: () => cy.get('.govuk-table__body .govuk-table__row'),
  row: {
    nameLink: (id) => cy.get(`[data-cy="facility__name--link--${id}"]`),
    ukefFacilityId: (id) => cy.get(`[data-cy="facility__ukefId--${id}"]`),
    type: (id) => cy.get(`[data-cy="facility__type--${id}"]`),
    noticeType: (id) => cy.get(`[data-cy="facility__noticeType--${id}"]`),
    value: (id) => cy.get(`[data-cy="facility__value--${id}"]`),
    bankStage: (id) => cy.get(`[data-cy="facility__bankStage--${id}"]`),
    issuedDate: (id) => cy.get(`[data-cy="facility__issuedDate--${id}"]`),
  },
  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
  filters: {
    panel: {
      form: {
        type: {
          gef: {
            label: () => cy.get('[data-cy="filter-label-type-GEF"]'),
            checkbox: () => cy.get('[data-cy="filter-input-type-GEF"]'),
          },
          cash: {
            label: () => cy.get('[data-cy="filter-label-type-Cash"]'),
            checkbox: () => cy.get('[data-cy="filter-input-type-Cash"]'),
          },
          contingent: {
            label: () => cy.get('[data-cy="filter-label-type-Contingent"]'),
            checkbox: () => cy.get('[data-cy="filter-input-type-Contingent"]'),
          },
          bond: {
            label: () => cy.get('[data-cy="filter-label-type-Bond"]'),
            checkbox: () => cy.get('[data-cy="filter-input-type-Bond"]'),
          },
          loan: {
            label: () => cy.get('[data-cy="filter-label-type-Loan"]'),
            checkbox: () => cy.get('[data-cy="filter-input-type-Loan"]'),
          },
        },
        hasBeenIssued: {
          issued: {
            label: () => cy.get('[data-cy="filter-label-hasBeenIssued-true"]'),
            checkbox: () => cy.get('[data-cy="filter-input-hasBeenIssued-true"]'),
          },
          unissued: {
            label: () => cy.get('[data-cy="filter-label-hasBeenIssued-false"]'),
            checkbox: () => cy.get('[data-cy="filter-input-hasBeenIssued-false"]'),
          },
        },
      },
    },
  },
};

module.exports = page;
