const { formatFieldValue } = require('./helpers');
const {
  FIELD_NAMES,
  SUBMISSION_TYPE,
} = require('../../../constants');

/**
 * Generate an object to be consumed by GOVUK component.
 * This will be an object in items array for checkboxes component.
 *
 * @param {string} field name
 * @param {string} field value
 * @param {object} submitted filters
 * @example ( field: 'dealType', text: 'GEF deals', value: 'GEF', submittedFilters: { dealType: ['GEF', 'BSS/EWCS'] })
 * @returns { text: 'GEF deals', value: 'GEF', checked: true }
 */
const generateFilterObject = (
  field,
  text,
  value,
  submittedFilters,
) => {
  let checked = false;

  const hasSubmittedFilters = Object.keys(submittedFilters).length;

  if (hasSubmittedFilters) {
    const filterHasBeenSubmitted = (submittedFilters[field]
      && submittedFilters[field].includes(String(value)));

    if (filterHasBeenSubmitted) {
      checked = true;
    }
  }

  const formattedFieldValue = formatFieldValue(value);

  return {
    label: {
      attributes: {
        'data-cy': `filter-label-${field}-${formattedFieldValue}`,
      },
    },
    text,
    value,
    checked,
    attributes: {
      'data-cy': `filter-input-${field}-${formattedFieldValue}`,
    },
  };
};

/**
 * Generate an array of objects to be consumed by GOVUK component.
 * This will used in the checkboxes component 'items' array.
 *
 * @param {string} field name
 * @param {array} array of field values - all possible values for the field name
 * @param {object} submitted filters
 * @example ( fieldName: 'dealType', fieldInputs: [ { text: 'GEF', value: 'GEF' }, { text: 'Issued', value: true } ], submittedFilters: { dealType: ['GEF'] })
 * @returns [ { text: 'GEF', value: 'GEF', checked: true }, { text: 'BSS/EWCS', value: 'BSS/EWCS', checked: false } ]
 */
const generateFiltersArray = (fieldName, fieldInputs, submittedFilters) => {
  const filtersArray = fieldInputs.map(({ text, value }) =>
    generateFilterObject(
      fieldName,
      text,
      value,
      submittedFilters,
    ));

  return filtersArray;
};

/**
 * Create filters array for the 'submissionType' (or 'Notice type') field.
 * This will used in the checkboxes component 'items' array.
 */
const submissionTypeFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.DEAL.SUBMISSION_TYPE;

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
