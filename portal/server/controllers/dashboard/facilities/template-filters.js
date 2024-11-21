const { FACILITY_TYPE, FACILITY_STAGE, isTfmDealCancellationFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { FIELD_NAMES } = require('../../../constants');
const {
  DASHBOARD_FILTERS: { BESPOKE_FILTER_VALUES },
} = require('../../../content-strings');
const { generateFiltersArray, submissionTypeFilters } = require('../filters/generate-template-filters');

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
const stageFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.FACILITY.STAGE;

  const fieldInputs = [
    {
      text: BESPOKE_FILTER_VALUES.FACILITIES.ISSUED,
      value: BESPOKE_FILTER_VALUES.FACILITIES.ISSUED,
    },
    {
      text: BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED,
      value: BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED,
    },
  ];

  if (isTfmDealCancellationFeatureFlagEnabled()) {
    fieldInputs.push({
      text: FACILITY_STAGE.RISK_EXPIRED,
      value: FACILITY_STAGE.RISK_EXPIRED,
    });
  }

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
  'deal.submissionType': submissionTypeFilters(`deal.${FIELD_NAMES.DEAL.SUBMISSION_TYPE}`, submittedFilters),
  stage: stageFilters(submittedFilters),
});

module.exports = {
  typeFilters,
  stageFilters,
  facilitiesTemplateFilters,
  createdByYouFilter,
};
