const page = {
  visit: () => cy.visit('/dashboard/deals/0'),
  tableHeader: (column) => cy.get(`[data-cy="deal__header--${column}"]`),
  rows: () => cy.get('.govuk-table__body .govuk-table__row'),
  exporterButton: () => cy.get('[data-cy="deal__header--exporter-button"]'),
  row: {
    exporter: (id) => cy.get(`[data-cy="deal__exporter--${id}"]`),
    bankRef: (id) => cy.get(`[data-cy="deal__bankRef--bankInternalRefName${id}"]`),
    link: (id) => cy.get(`[data-cy="deal__link--${id}"]`),
    product: (id) => cy.get(`[data-cy="deal__product--${id}"]`),
    status: (id) => cy.get(`[data-cy="deal__status--${id}"]`),
    type: (id) => cy.get(`[data-cy="deal__submissionType--${id}"]`),
    updated: (id) => cy.get(`[data-cy="deal__updated--${id}"]`),
  },
  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
  filters: {
    panel: {
      form: {
        createdByYou: {
          label: () => cy.get('[data-cy="filter-label-createdBy-Created-by-you"]'),
          checkbox: () => cy.get('[data-cy="filter-input-createdBy-Created-by-you"]'),
        },
        dealType: {
          bssEwcs: {
            label: () => cy.get('[data-cy="filter-label-dealType-BSS-EWCS"]'),
            checkbox: () => cy.get('[data-cy="filter-input-dealType-BSS-EWCS"]'),
          },
          gef: {
            label: () => cy.get('[data-cy="filter-label-dealType-GEF"]'),
            checkbox: () => cy.get('[data-cy="filter-input-dealType-GEF"]'),
          },
        },
        submissionType: {
          AIN: {
            label: () => cy.get('[data-cy="filter-label-submissionType-Automatic-Inclusion-Notice"]'),
            checkbox: () => cy.get('[data-cy="filter-input-submissionType-Automatic-Inclusion-Notice"]'),
          },
          MIA: {
            label: () => cy.get('[data-cy="filter-label-submissionType-Manual-Inclusion-Application"]'),
            checkbox: () => cy.get('[data-cy="filter-input-submissionType-Manual-Inclusion-Application"]'),
          },
          MIN: {
            label: () => cy.get('[data-cy="filter-label-submissionType-Manual-Inclusion-Notice"]'),
            checkbox: () => cy.get('[data-cy="filter-input-submissionType-Manual-Inclusion-Notice"]'),
          },
        },
        status: {
          all: {
            label: () => cy.get('[data-cy="filter-label-status-All-statuses"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-All-statuses"]'),
          },
          draft: {
            label: () => cy.get('[data-cy="filter-label-status-Draft"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Draft"]'),
          },
          readyForChecker: {
            label: () => cy.get('[data-cy="filter-label-status-Ready-for-Checkers-approval"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Ready-for-Checkers-approval"]'),
          },
          makerInputRequired: {
            label: () => cy.get('[data-cy="filter-label-status-Further-Makers-input-required"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Further-Makers-input-required"]'),
          },
          submitted: {
            label: () => cy.get('[data-cy="filter-label-status-Submitted"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Submitted"]'),
          },
          acknowledgedByUKEF: {
            label: () => cy.get('[data-cy="filter-label-status-Acknowledged"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Acknowledged"]'),
          },
          inProgressByUKEF: {
            label: () => cy.get('[data-cy="filter-label-status-In-progress-by-UKEF"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-In-progress-by-UKEF"]'),
          },
          acceptedByUKEFWithConditions: {
            label: () => cy.get('[data-cy="filter-label-status-Accepted-by-UKEF-(with-conditions)"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Accepted-by-UKEF-(with-conditions)"]'),
          },
          acceptedByUKEFWithoutConditions: {
            label: () => cy.get('[data-cy="filter-label-status-Accepted-by-UKEF-(without-conditions)"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Accepted-by-UKEF-(without-conditions)"]'),
          },
          rejectedByUKEF: {
            label: () => cy.get('[data-cy="filter-label-status-Rejected-by-UKEF"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Rejected-by-UKEF"]'),
          },
          abandoned: {
            label: () => cy.get('[data-cy="filter-label-status-Abandoned"]'),
            checkbox: () => cy.get('[data-cy="filter-input-status-Abandoned"]'),
          },
        },
      },
    },
    mainContainer: {
      selectedFilters: {
        createdByYou: () => cy.get('[data-cy="main-container-selected-filter-Created-by-you'),

        noticeAIN: () => cy.get('[data-cy="main-container-selected-filter-Automatic-Inclusion-Notice'),
        noticeMIN: () => cy.get('[data-cy="main-container-selected-filter-Manual-Inclusion-Notice'),
        noticeMIA: () => cy.get('[data-cy="main-container-selected-filter-Manual-Inclusion-Application'),
        productGEF: () => cy.get('[data-cy="main-container-selected-filter-GEF'),

        statusDraft: () => cy.get('[data-cy="main-container-selected-filter-Draft'),
        statusReadyForChecker: () => cy.get('[data-cy="main-container-selected-filter-Ready-for-Checkers-approval'),
        statusAll: () => cy.get('[data-cy="main-container-selected-filter-All-statuses'),
      },
    },
  },
};

module.exports = page;
