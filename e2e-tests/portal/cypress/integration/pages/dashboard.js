const page = {
  visit: () => cy.visit('/dashboard/deals/0'),

  createNewSubmission: () => cy.get('[data-cy="CreateNewSubmission"]'),

  createdByYouCheckbox: () => cy.get('[data-cy="created-by-you-checkbox"]'),

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


  filtersShowHideButton: () => cy.get('[data-cy="filters-action-bar"] button').first(),
  filtersContainer: () => cy.get('[data-cy="filters-container"]'),
  filtersApplyFiltersButton: () => cy.get('[data-cy="filters-container"] button'),

  filterLabelKeyword: () => cy.get('[data-cy="filter-label-keyword"]'),
  filterInputKeyword: () => cy.get('[data-cy="filter-input-keyword"]'),

  // dealType/product
  filterLabelDealTypeBssEwcs: () => cy.get('[data-cy="filter-label-dealType-BSS-EWCS"]'),
  filterCheckboxDealTypeBssEwcs: () => cy.get('[data-cy="filter-input-dealType-BSS-EWCS"]'),

  filterLabelDealTypeGef: () => cy.get('[data-cy="filter-label-dealType-GEF"]'),
  filterCheckboxDealTypeGef: () => cy.get('[data-cy="filter-input-dealType-GEF"]'),

  // submissionType/notice type
  filterLabelSubmissionTypeAIN: () => cy.get('[data-cy="filter-label-submissionType-Automatic-Inclusion-Notice"]'),
  filterCheckboxSubmissionTypeAIN: () => cy.get('[data-cy="filter-input-submissionType-Automatic-Inclusion-Notice"]'),

  filterLabelSubmissionTypeMIA: () => cy.get('[data-cy="filter-label-submissionType-Manual-Inclusion-Application"]'),
  filterCheckboxSubmissionTypeMIA: () => cy.get('[data-cy="filter-input-submissionType-Manual-Inclusion-Application"]'),

  filterLabelSubmissionTypeMIN: () => cy.get('[data-cy="filter-label-submissionType-Manual-Inclusion-Notice"]'),
  filterCheckboxSubmissionTypeMIN: () => cy.get('[data-cy="filter-input-submissionType-Manual-Inclusion-Notice"]'),

  // status
  filterLabelStatusAllStatuses: () => cy.get('[data-cy="filter-label-status-All-statuses"]'),
  filterCheckboxStatusAllStatuses: () => cy.get('[data-cy="filter-input-status-All-statuses"]'),

  filterLabelStatusDraft: () => cy.get('[data-cy="filter-label-status-Draft"]'),
  filterCheckboxStatusDraft: () => cy.get('[data-cy="filter-input-status-Draft"]'),

  filterLabelStatusReadyForChecker: () => cy.get('[data-cy="filter-label-status-Ready-for-Checkers-approval"]'),
  filterCheckboxStatusReadyForChecker: () => cy.get('[data-cy="filter-input-status-Ready-for-Checkers-approval"]'),

  filterLabelStatusMakerInputRequired: () => cy.get('[data-cy="filter-label-status-Further-Makers-input-required"]'),
  filterCheckboxStatusMakerInputRequired: () => cy.get('[data-cy="filter-input-status-Further-Makers-input-required"]'),

  filterLabelStatusSubmitted: () => cy.get('[data-cy="filter-label-status-Submitted"]'),
  filterCheckboxStatusSubmitted: () => cy.get('[data-cy="filter-input-status-Submitted"]'),

  filterLabelStatusAcknowledgedByUKEF: () => cy.get('[data-cy="filter-label-status-Acknowledged-by-UKEF"]'),
  filterCheckboxStatusAcknowledgedByUKEF: () => cy.get('[data-cy="filter-input-status-Acknowledged-by-UKEF"]'),

  filterLabelStatusInProgressByUKEF: () => cy.get('[data-cy="filter-label-status-In-progress-by-UKEF"]'),
  filterCheckboxStatusInProgressByUKEF: () => cy.get('[data-cy="filter-input-status-In-progress-by-UKEF"]'),

  filterLabelStatusAcceptedByUKEFWithConditions: () => cy.get('[data-cy="filter-label-status-Accepted-by-UKEF-(with-conditions)"]'),
  filterCheckboxStatusAcceptedByUKEFWithConditions: () => cy.get('[data-cy="filter-input-status-Accepted-by-UKEF-(with-conditions)"]'),

  filterLabelStatusAcceptedByUKEFWithoutConditions: () => cy.get('[data-cy="filter-label-status-Accepted-by-UKEF-(without-conditions)"]'),
  filterCheckboxStatusAcceptedByUKEFWithoutConditions: () => cy.get('[data-cy="filter-input-status-Accepted-by-UKEF-(without-conditions)"]'),

  filterLabelStatusRejectedByUKEF: () => cy.get('[data-cy="filter-label-status-Rejected-by-UKEF"]'),
  filterCheckboxStatusRejectedByUKEF: () => cy.get('[data-cy="filter-input-status-Rejected-by-UKEF"]'),

  filterLabelStatusAbandoned: () => cy.get('[data-cy="filter-label-status-Abandoned"]'),
  filterCheckboxStatusAbandoned: () => cy.get('[data-cy="filter-input-status-Abandoned"]'),

  // selected filters
  // NOTE: at the time of writing, it is not possible to pass custom data-cy attributes to MOJ filter component.
  filtersAppliedContainer: () => cy.get('[data-cy="filters-container"] .moj-filter__selected'),
  filtersAppliedHeading: () => cy.get('[data-cy="filters-container"] .moj-filter__selected h3'),
  filtersAppliedList: () => cy.get('[data-cy="filters-container"] .moj-filter__selected .moj-filter-tags'),
  filtersAppliedListItem: () => cy.get('[data-cy="filters-container"] .moj-filter__selected .moj-filter-tags li'),
  filtersClearAllLink: () => cy.get('[data-cy="filters-container"] .moj-filter__selected .moj-filter__heading-action a'),

  // selected filters - main container
  filtersSelectedMainContainer: () => cy.get('[data-cy="main-container-selected-filters'),
  filtersSelectedMainContainerKeyword: (keyword) => cy.get(`[data-cy="main-container-selected-filter-${keyword}"]`),

  filtersSelectedMainContainerNoticeMIA: () => cy.get('[data-cy="main-container-selected-filter-Manual-Inclusion-Application'),

  filtersSelectedMainContainerProductGEF: () => cy.get('[data-cy="main-container-selected-filter-GEF'),

  filtersSelectedMainContainerStatusDraft: () => cy.get('[data-cy="main-container-selected-filter-Draft'),
  filtersSelectedMainContainerStatusReadyForChecker: () => cy.get('[data-cy="main-container-selected-filter-Ready-for-Checkers-approval'),
  filtersSelectedMainContainerStatusAll: () => cy.get('[data-cy="main-container-selected-filter-All-statuses'),
};

module.exports = page;
