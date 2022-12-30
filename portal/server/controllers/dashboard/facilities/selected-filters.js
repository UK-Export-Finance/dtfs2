const {
  generateSelectedFiltersObject,
  generateSelectedFiltersObjectWithMappedValues,
  selectedSubmissionTypeFilters,
} = require('../filters/generate-selected-filters');
const CONTENT_STRINGS = require('../../../content-strings');
const CONSTANTS = require('../../../constants');

/**
 * Map true/false boolean to Issued/Unissued string.
 *
 * @param {boolean} the submitted filter value
 * @example ( true )
 * @returns 'Issued'
 */
const mapIssuedValueToText = (hasBeenIssued) => {
  if (hasBeenIssued) {
    return CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED;
  }

  return CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED;
};

/**
 * Create an object for all selected hasBeenIssued filters.
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {string} field heading
 * @param {string} field name
 * @param {object} submitted hasBeenIssued filters
 * @example ( 'Bank facility stage', 'hasBeenIssued', [ true, false ] )
 * @returns generateSelectedFiltersObjectWithMappedValues('Facility stage', 'hasBeenIssued', [ {value: true, mappedValue: 'Issued' }])
 */
const selectedHasBeenIssuedFilters = (
  heading,
  fieldName,
  submittedFilters,
) => {
  const mappedFilters = submittedFilters.map((value) => ({
    value,
    mappedValue: mapIssuedValueToText(value),
  }));

  const selectedFiltersObj = generateSelectedFiltersObjectWithMappedValues(
    heading,
    fieldName,
    mappedFilters,
  );

  return selectedFiltersObj;
};

/**
 * Create an array of objects for all selected filters.
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {object} submitted filters
 * @returns [ generateSelectedFiltersObject(...params), generateSelectedFiltersObject(...params) ]
 */
const selectedFilters = (submittedFilters) => {
  const selected = [];

  const hasKeyword = (submittedFilters.keyword && submittedFilters.keyword[0].length);

  if (hasKeyword) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.KEYWORD,
      CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD,
      submittedFilters.keyword,
    ));
  }

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

  if (submittedFilters[CONSTANTS.FIELD_NAMES.FACILITY.CREATED_BY]) {
    selected.push(generateSelectedFiltersObject(
      CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.CREATED,
      CONSTANTS.FIELD_NAMES.FACILITY.CREATED_BY,
      submittedFilters.createdBy,
    ));
  }

  return selected;
};

module.exports = {
  mapIssuedValueToText,
  selectedFilters,
  selectedHasBeenIssuedFilters,
};
