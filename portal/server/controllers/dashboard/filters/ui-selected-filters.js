const CONTENT_STRINGS = require('../../../content-strings');
const CONSTANTS = require('../../../constants');

/**
 * Create an object for a single, selected filter
 * This will used in mojFilter component - selectedFilters.categories.
 */
const generateSelectedFiltersObject = (
  heading,
  fieldName,
  submittedFieldFilters,
) => ({
  heading: {
    text: heading,
  },
  items: submittedFieldFilters.map((fieldValue) => {
    const formattedFieldValue = fieldValue.replace('/', '-');

    return {
      text: fieldValue,
      href: `filters/remove/${fieldName}/${formattedFieldValue}`,
    };
  }),
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
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.KEYWORD,
      'keyword',
      submittedFilters.keyword,
    ));
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.DEAL.DEAL_TYPE]) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT,
      CONSTANTS.FIELD_NAMES.DEAL.DEAL_TYPE,
      submittedFilters.dealType,
    ));
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE]) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.NOTICE_TYPE,
      CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
      submittedFilters.submissionType,
    ));
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.DEAL.STATUS]) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.STATUS,
      CONSTANTS.FIELD_NAMES.DEAL.STATUS,
      submittedFilters.status,
    ));
  }

  return selected;
};

module.exports = {
  generateSelectedFiltersObject,
  selectedDashboardFilters,
};
