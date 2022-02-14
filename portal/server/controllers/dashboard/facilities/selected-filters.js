const {
  generateSelectedFiltersObject,
  selectedSubmissionTypeFilters,
  selectedHasBeenIssuedFilters,
} = require('../filters/generate-selected-filters');
const CONTENT_STRINGS = require('../../../content-strings');
const CONSTANTS = require('../../../constants');

/**
 * Create an array of objects for all selected filters.
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {object} submitted filters
 * @returns [ generateSelectedFiltersObject(...params), generateSelectedFiltersObject(...params) ]
 */
const selectedFilters = (submittedFilters) => {
  const selected = [];

  if (submittedFilters[CONSTANTS.FIELD_NAMES.FACILITY.TYPE]) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT,
      CONSTANTS.FIELD_NAMES.FACILITY.TYPE,
      submittedFilters.type,
    ));
  }

  if (submittedFilters[`deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`]) {
    const obj = selectedSubmissionTypeFilters(
      `deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`,
      submittedFilters[`deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`],
    );
    selected.push(obj);
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED]) {
    selected.push(selectedHasBeenIssuedFilters(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.FACILITY_STAGE,
      CONSTANTS.FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED,
      submittedFilters.hasBeenIssued,
    ));
  }

  return selected;
};

module.exports = {
  selectedFilters,
};
