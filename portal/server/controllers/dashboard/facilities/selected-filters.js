const { generateSelectedFiltersObject, selectedSubmissionTypeFilters } = require('../filters/generate-selected-filters');
const CONTENT_STRINGS = require('../../../content-strings');
const CONSTANTS = require('../../../constants');

/**
 * Create an array of objects for all selected filters.
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {Object} submitted filters
 * @returns [ generateSelectedFiltersObject(...params), generateSelectedFiltersObject(...params) ]
 */
const selectedFilters = (submittedFilters) => {
  const selected = [];

  const hasKeyword = submittedFilters.keyword && submittedFilters.keyword[0].length;

  if (hasKeyword) {
    selected.push(
      generateSelectedFiltersObject(
        CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.KEYWORD,
        CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD,
        submittedFilters.keyword,
      ),
    );
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.FACILITY.TYPE]) {
    selected.push(
      generateSelectedFiltersObject(CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT, CONSTANTS.FIELD_NAMES.FACILITY.TYPE, submittedFilters.type),
    );
  }

  if (submittedFilters[`deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`]) {
    const obj = selectedSubmissionTypeFilters(
      `deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`,
      submittedFilters[`deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`],
    );
    selected.push(obj);
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.FACILITY.STAGE]) {
    selected.push(
      generateSelectedFiltersObject(
        CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.FACILITY_STAGE,
        CONSTANTS.FIELD_NAMES.FACILITY.STAGE,
        submittedFilters.stage,
      ),
    );
  }

  if (submittedFilters[CONSTANTS.FIELD_NAMES.FACILITY.CREATED_BY]) {
    selected.push(
      generateSelectedFiltersObject(
        CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.CREATED,
        CONSTANTS.FIELD_NAMES.FACILITY.CREATED_BY,
        submittedFilters.createdBy,
      ),
    );
  }

  return selected;
};

module.exports = {
  selectedFilters,
};
