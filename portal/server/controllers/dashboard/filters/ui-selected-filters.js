const CONTENT_STRINGS = require('../../../content-strings');
const CONSTANTS = require('../../../constants');

/**
 * Create an object for a single, selected filter
 * This will used in mojFilter component - selectedFilters.categories.
 */
const generateSelectedFiltersObject = (
  heading,
  submittedFieldFilters,
) => ({
  heading: {
    text: heading,
  },
  items: submittedFieldFilters.map((fieldValue) => ({
    text: fieldValue,
    href: '#',
  })),
});

/**
 * Create an array of objects for all selected filters.
 * This will used in mojFilter component - selectedFilters.categories.
 */
const selectedDashboardFilters = (submittedFilters) => {
  const selected = [];

  const hasKeyword = (submittedFilters.keyword && submittedFilters.keyword[0].length);

  if (hasKeyword) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.KEYWORD,
      submittedFilters.keyword,
    ));
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.DEAL.DEAL_TYPE]) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT,
      submittedFilters.dealType,
    ));
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE]) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.NOTICE_TYPE,
      submittedFilters.submissionType,
    ));
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.DEAL.STATUS]) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.STATUS,
      submittedFilters.status,
    ));
  }

  return selected;
};

module.exports = {
  generateSelectedFiltersObject,
  selectedDashboardFilters,
};
