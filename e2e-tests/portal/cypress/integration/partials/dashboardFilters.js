const partial = {
  showHideButton: () => cy.get('[data-cy="filters-action-bar"] button').first(),
  panel: {
    container: () => cy.get('[data-cy="filters-container"]'),
    form: {
      applyFiltersButton: () => cy.get('[data-cy="filters-container"] button'),
      keyword: {
        label: () => cy.get('[data-cy="filter-label-keyword"]'),
        input: () => cy.get('[data-cy="filter-input-keyword"]'),
      },
    },
    selectedFilters: {
      // NOTE: at the time of writing, it is not possible to pass custom data-cy attributes to MOJ filter component.
      container: () => cy.get('[data-cy="filters-container"] .moj-filter__selected'),
      heading: () => cy.get('[data-cy="filters-container"] .moj-filter__selected h3'),
      list: () => cy.get('[data-cy="filters-container"] .moj-filter__selected .moj-filter-tags'),
      listItem: () => cy.get('[data-cy="filters-container"] .moj-filter__selected .moj-filter-tags li'),
      clearAllLink: () => cy.get('[data-cy="filters-container"] .moj-filter__selected .moj-filter__heading-action a'),
    },
  },
  mainContainer: {
    selectedFilters: {
      container: () => cy.get('[data-cy="main-container-selected-filters'),
      keyword: (keyword) => cy.get(`[data-cy="main-container-selected-filter-${keyword.replace(' ', '-')}"]`),
      noticeAIN: () => cy.get('[data-cy="main-container-selected-filter-Automatic-Inclusion-Notice'),
      noticeMIN: () => cy.get('[data-cy="main-container-selected-filter-Manual-Inclusion-Notice'),
      noticeMIA: () => cy.get('[data-cy="main-container-selected-filter-Manual-Inclusion-Application'),
    },
  },
};

module.exports = partial;
