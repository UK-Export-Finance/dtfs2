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
        submissionType: {
          AIN: {
            label: () => cy.get('[data-cy="filter-label-deal.submissionType-Automatic-Inclusion-Notice"]'),
            checkbox: () => cy.get('[data-cy="filter-input-deal.submissionType-Automatic-Inclusion-Notice"]'),
          },
          MIA: {
            label: () => cy.get('[data-cy="filter-label-deal.submissionType-Manual-Inclusion-Application"]'),
            checkbox: () => cy.get('[data-cy="filter-input-deal.submissionType-Manual-Inclusion-Application"]'),
          },
          MIN: {
            label: () => cy.get('[data-cy="filter-label-deal.submissionType-Manual-Inclusion-Notice"]'),
            checkbox: () => cy.get('[data-cy="filter-input-deal.submissionType-Manual-Inclusion-Notice"]'),
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
    mainContainer: {
      selectedFilters: {
        typeCash: () => cy.get('[data-cy="main-container-selected-filter-Cash'),
        typeContingent: () => cy.get('[data-cy="main-container-selected-filter-Contingent'),
        typeBond: () => cy.get('[data-cy="main-container-selected-filter-Bond'),
        typeLoan: () => cy.get('[data-cy="main-container-selected-filter-Loan'),
        typeIssued: () => cy.get('[data-cy="main-container-selected-filter-Issued'),
        typeUnissued: () => cy.get('[data-cy="main-container-selected-filter-Unissued'),
      },
    },
  },
};

module.exports = page;
