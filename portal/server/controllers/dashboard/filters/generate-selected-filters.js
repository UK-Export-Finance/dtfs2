const { formatFieldValue } = require('./helpers');
const CONTENT_STRINGS = require('../../../content-strings');
const CONSTANTS = require('../../../constants');

/**
 * Create an object for a single, selected filter
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {string} field heading
 * @param {string} field name
 * @param {array} submitted filters
 * @example ( 'Mock heading', 'dealType', [ 'BSS/EWCS', 'GEF' ] )
 * @returns { heading: { text: 'Mock heading' }, items: [ { text: 'BSS-EWCS', href: `filters/remove/dealType/BSS-EWCS`, value: 'BSS-EWCS' } ] }
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
    const formattedFieldValue = formatFieldValue(fieldValue);

    return {
      text: fieldValue,
      href: `filters/remove/${fieldName}/${formattedFieldValue}`,
      formattedFieldValue,
    };
  }),
});

/**
 * Create an object for all selected submissionType filters.
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {object} submitted submissionType filters
 * @example ( ['Automatic Inclusion Notice', 'Manual Inclusion Notice'] )
 * @returns generateSelectedFiltersObject('Notice Type', 'submissionType', ['Automatic Inclusion Notice', 'Manual Inclusion Notice'])
 */
const selectedSubmissionTypeFilters = (submittedFilters) =>
  generateSelectedFiltersObject(
    CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.NOTICE_TYPE,
    CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
    submittedFilters,
  );

/**
 * Map true/false string to Issued/Unissued string.
 *
 * @param {string} the submitted filter value
 * @example ( 'true' )
 * @returns 'Issued'
 */
const mapIssuedValueToText = (hasBeenIssued) => {
  if (hasBeenIssued === 'true') {
    return CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED;
  }

  return CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED;
};

/**
 * Create an object for all selected hasBeenIssued filters.
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {object} submitted hasBeenIssued filters
 * @example ( ['true', 'false'] )
 * @returns generateSelectedFiltersObject('Facility stage', 'hasBeenIssued', ['Issued', 'Unissued'])
 */
const selectedHasBeenIssuedFilters = (
  heading,
  fieldName,
  submittedFilters,
) => {
  const mappedFilters = submittedFilters.map((value) =>
    mapIssuedValueToText(value));

  return generateSelectedFiltersObject(
    heading,
    fieldName,
    mappedFilters,
  );
};

module.exports = {
  generateSelectedFiltersObject,
  selectedSubmissionTypeFilters,
  mapIssuedValueToText,
  selectedHasBeenIssuedFilters,
};
