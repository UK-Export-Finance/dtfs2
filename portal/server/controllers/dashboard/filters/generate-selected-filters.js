const { formatFieldValue } = require('./helpers');
const CONTENT_STRINGS = require('../../../content-strings');

/**
 * Create an object for a single, selected filter
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {string} field heading
 * @param {string} field name
 * @param {Array} submitted filters
 * @example ( 'Deal type', 'dealType', ['BSS/EWCS', 'GEF'] )
 * @returns { heading: { text: 'Deal type' }, items: [ { text: 'BSS-EWCS', href: `filters/remove/dealType/BSS-EWCS`, value: 'BSS-EWCS' } ] }
 */
const generateSelectedFiltersObject = (heading, fieldName, submittedFieldFilters) => ({
  heading: {
    text: heading,
  },
  items: submittedFieldFilters.map((fieldValue) => {
    const formattedValue = formatFieldValue(fieldValue);

    return {
      text: fieldValue,
      href: `filters/remove/${fieldName}/${formattedValue}`,
      formattedValue,
    };
  }),
});

/**
 * Create an object for all selected submissionType filters.
 * This will used in mojFilter component - selectedFilters.categories.
 *
 * @param {string} field name
 * @param {object} submitted submissionType filters
 * @example ( ['Automatic Inclusion Notice', 'Manual Inclusion Notice'] )
 * @returns generateSelectedFiltersObject('Notice Type', 'submissionType', ['Automatic Inclusion Notice', 'Manual Inclusion Notice'])
 */
const selectedSubmissionTypeFilters = (fieldName, submittedFilters) =>
  generateSelectedFiltersObject(CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.NOTICE_TYPE, fieldName, submittedFilters);

module.exports = {
  generateSelectedFiltersObject,
  selectedSubmissionTypeFilters,
};
