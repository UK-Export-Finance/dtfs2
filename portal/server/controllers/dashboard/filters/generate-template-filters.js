const { formatFieldValue } = require('./helpers');
const { SUBMISSION_TYPE } = require('../../../constants');

/**
 * Generate an object to be consumed by GOVUK component.
 * This will be an object in items array for checkboxes component.
 *
 * @param {string} field the field name
 * @param {string} text the field text to display
 * @param {boolean | string} value the filter value
 * @param {object} submittedFilters the submitted field object
 * @example ( field: 'dealType', text: 'GEF deals', value: 'GEF', submittedFilters: { dealType: ['GEF', 'BSS/EWCS'] })
 * @returns { text: 'GEF deals', value: 'GEF', checked: true }
 */
const generateFilterObject = (field, text, value, submittedFilters) => {
  const isFieldInSubmittedFilters = !!(Object.keys(submittedFilters).length && submittedFilters[field]);
  const isChecked = isFieldInSubmittedFilters && String(submittedFilters[field]).includes(String(value));

  const formattedFieldValue = formatFieldValue(value);

  return {
    label: {
      attributes: {
        'data-cy': `filter-label-${formattedFieldValue}`,
      },
    },
    text,
    value,
    checked: isChecked,
    attributes: {
      'data-cy': `filter-input-${formattedFieldValue}`,
    },
  };
};

/**
 * Generate an array of objects to be consumed by GOVUK component.
 * This will used in the checkboxes component 'items' array.
 *
 * @param {string} field name
 * @param {Array} array of field values - all possible values for the field name
 * @param {object} submitted filters
 * @example ( fieldName: 'dealType', fieldInputs: [ { text: 'GEF', value: 'GEF' }, { text: 'Issued', value: true } ], submittedFilters: { dealType: ['GEF'] })
 * @returns [ { text: 'GEF', value: 'GEF', checked: true }, { text: 'BSS/EWCS', value: 'BSS/EWCS', checked: false } ]
 */
const generateFiltersArray = (fieldName, fieldInputs, submittedFilters) => {
  const filtersArray = fieldInputs.map(({ text, value }) => generateFilterObject(fieldName, text, value, submittedFilters));

  return filtersArray;
};

/**
 * Create filters array for the 'submissionType' (or 'Notice type') field.
 * This will used in the checkboxes component 'items' array.
 */
const submissionTypeFilters = (fieldName, submittedFilters) => {
  const fieldInputs = [
    { text: SUBMISSION_TYPE.AIN, value: SUBMISSION_TYPE.AIN },
    { text: SUBMISSION_TYPE.MIA, value: SUBMISSION_TYPE.MIA },
    { text: SUBMISSION_TYPE.MIN, value: SUBMISSION_TYPE.MIN },
  ];

  return generateFiltersArray(fieldName, fieldInputs, submittedFilters);
};

module.exports = {
  generateFilterObject,
  generateFiltersArray,
  submissionTypeFilters,
};
