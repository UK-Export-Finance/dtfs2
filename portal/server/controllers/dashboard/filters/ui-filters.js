const {
  FIELD_NAMES,
  PRODUCT,
  SUBMISSION_TYPE,
  STATUS,
} = require('../../../constants');
const CONTENT_STRINGS = require('../../../content-strings');

/**
 * Generates an object to be consumed by GOVUK component.
 * This will be an object in items array for checkboxes component.
 *
 * @param {string} field name
 * @param {string} field value
 * @param {object} submitted filters
 * @example ( field: 'dealType', value: 'GEF', submittedFilters: { dealType: ['GEF', 'BSS/EWCS'] })
 * @returns { text: 'GEF', value: 'GEF', checked: true }
 */
const generateFilterObject = (field, value, submittedFilters) => {
  let checked = false;

  const hasSubmittedFilters = Object.keys(submittedFilters).length;

  if (hasSubmittedFilters) {
    const filterHasBeenSubmitted = (submittedFilters[field]
      && submittedFilters[field].includes(value));

    if (filterHasBeenSubmitted) {
      checked = true;
    }
  }

  // replace white space, dashes and single quotes.
  const formattedFieldValue = value.replace(/[\s+/]/g, '-').replace('\'', '');

  return {
    label: {
      attributes: {
        'data-cy': `filter-label-${field}-${formattedFieldValue}`,
      },
    },
    text: value,
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
 * @example ( fieldName: 'dealType', fieldValues: ['GEF', 'BSS/EWCS'], submittedFilters: { dealType: ['GEF'] })
 * @returns [ { text: 'GEF', value: 'GEF', checked: true }, { text: 'BSS/EWCS', value: 'BSS/EWCS', checked: false } ]
 */
const generateFiltersArray = (fieldName, fieldValues, submittedFilters) => {
  const filtersArray = fieldValues.map((fieldValue) =>
    generateFilterObject(
      fieldName,
      fieldValue,
      submittedFilters,
    ));

  return filtersArray;
};

/**
 * Create filters array for the 'dealType' (or 'product') field.
 * This will used in the checkboxes component 'items' array.
 */
const productFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.DEAL.DEAL_TYPE;

  const fieldValues = [
    PRODUCT.BSS_EWCS,
    PRODUCT.GEF,
  ];

  return generateFiltersArray(fieldName, fieldValues, submittedFilters);
};

/**
 * Create filters array for the 'submissionType' (or 'Notice type') field.
 * This will used in the checkboxes component 'items' array.
 */
const submissionTypeFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.DEAL.SUBMISSION_TYPE;

  const fieldValues = [
    SUBMISSION_TYPE.AIN,
    SUBMISSION_TYPE.MIA,
    SUBMISSION_TYPE.MIN,
  ];

  return generateFiltersArray(fieldName, fieldValues, submittedFilters);
};

/**
 * Create filters array for the 'status type' field.
 * This will used in the checkboxes component 'items' array.
 */
const statusFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.DEAL.STATUS;

  const fieldValues = [
    CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES,
    STATUS.DRAFT,
    STATUS.READY_FOR_APPROVAL,
    STATUS.INPUT_REQUIRED,
    STATUS.SUBMITTED,
    STATUS.SUBMISSION_ACKNOWLEDGED,
    STATUS.IN_PROGRESS_BY_UKEF,
    STATUS.APPROVED_WITH_CONDITIONS,
    STATUS.APPROVED,
    STATUS.REFUSED,
    STATUS.ABANDONED,
  ];

  return generateFiltersArray(fieldName, fieldValues, submittedFilters);
};

/**
 * Create an object for all filters.
 * This will used in multiple checkboxes components.
 */
const dashboardFilters = (submittedFilters = {}) => ({
  product: productFilters(submittedFilters),
  submissionType: submissionTypeFilters(submittedFilters),
  status: statusFilters(submittedFilters),
});

module.exports = {
  generateFilterObject,
  generateFiltersArray,
  productFilters,
  submissionTypeFilters,
  statusFilters,
  dashboardFilters,
};
