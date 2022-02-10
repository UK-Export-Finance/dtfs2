const {
  generateSelectedFiltersObject,
  selectedSubmissionTypeFilters,
} = require('../filters/generate-selected-filters');
const CONTENT_STRINGS = require('../../../content-strings');
const CONSTANTS = require('../../../constants');

/**
 * Create an array of objects for all selected filters.
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {object} submitted filters
 * @example ( { keyword: 'Special exporter' }, { dealType: ['BSS/EWCS', 'GEF'] } )
 * @returns [ generateSelectedFiltersObject(...params), generateSelectedFiltersObject(...params) ]
 */
const selectedFilters = (submittedFilters) => {
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
    const obj = selectedSubmissionTypeFilters(
      CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
      submittedFilters[CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE],
    );
    selected.push(obj);
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
  selectedFilters,
};
