const {
  FIELD_NAMES,
  FACILITY_HAS_BEEN_ISSUED,
  FACILITY_TYPE,
} = require('../../../constants');
const { DASHBOARD_FILTERS: { BESPOKE_FILTER_VALUES } } = require('../../../content-strings');
const {
  generateFiltersArray,
  submissionTypeFilters,
} = require('../filters/generate-template-filters');

/**
 * Create filters array for the 'type' (or 'product') field.
 * This will used in the checkboxes component 'items' array.
 */
const typeFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.FACILITY.TYPE;

  const fieldInputs = [
    { text: FACILITY_TYPE.CASH, value: FACILITY_TYPE.CASH },
    { text: FACILITY_TYPE.CONTINGENT, value: FACILITY_TYPE.CONTINGENT },
    { text: FACILITY_TYPE.BOND, value: FACILITY_TYPE.BOND },
    { text: FACILITY_TYPE.LOAN, value: FACILITY_TYPE.LOAN },
  ];

  return generateFiltersArray(fieldName, fieldInputs, submittedFilters);
};

/**
 * Create filters array for the 'facility stage' field.
 * This will used in the checkboxes component 'items' array.
 */
const hasBeenIssuedFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED;

  const fieldInputs = [
    {
      text: BESPOKE_FILTER_VALUES.FACILITIES.ISSUED,
      value: FACILITY_HAS_BEEN_ISSUED.ISSUED,
    },
    {
      text: BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED,
      value: FACILITY_HAS_BEEN_ISSUED.UNISSUED,
    },
  ];

  return generateFiltersArray(fieldName, fieldInputs, submittedFilters);
};

const createdByYouFilter = (submittedFilters) => {
  const fieldName = FIELD_NAMES.FACILITY.CREATED_BY;

  const fieldInputs = [
    {
      text: BESPOKE_FILTER_VALUES.FACILITIES.CREATED_BY_YOU,
      value: BESPOKE_FILTER_VALUES.FACILITIES.CREATED_BY_YOU,
    },
  ];

  return generateFiltersArray(fieldName, fieldInputs, submittedFilters);
};

/**
 * Create an object for all filters.
 * This will used in multiple checkboxes components.
 */
const facilitiesTemplateFilters = (submittedFilters = {}) => ({
  createdBy: createdByYouFilter(submittedFilters),
  type: typeFilters(submittedFilters),
  'deal.submissionType': submissionTypeFilters(
    `deal.${FIELD_NAMES.DEAL.SUBMISSION_TYPE}`,
    submittedFilters,
  ),
  hasBeenIssued: hasBeenIssuedFilters(submittedFilters),
});

module.exports = {
  typeFilters,
  hasBeenIssuedFilters,
  facilitiesTemplateFilters,
  createdByYouFilter,
};
