const { DEAL_STATUS, isTfmDealCancellationFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { FIELD_NAMES, PRODUCT } = require('../../../constants');
const {
  DASHBOARD_FILTERS: { BESPOKE_FILTER_VALUES },
} = require('../../../content-strings');
const { generateFiltersArray, submissionTypeFilters } = require('../filters/generate-template-filters');

const createdByYouFilter = (submittedFilters) => {
  const fieldName = FIELD_NAMES.DEAL.CREATED_BY;

  const fieldInputs = [
    {
      text: BESPOKE_FILTER_VALUES.DEALS.CREATED_BY_YOU,
      value: BESPOKE_FILTER_VALUES.DEALS.CREATED_BY_YOU,
    },
  ];

  return generateFiltersArray(fieldName, fieldInputs, submittedFilters);
};

/**
 * Create filters array for the 'dealType' (or 'product') field.
 * This will used in the checkboxes component 'items' array.
 */
const dealTypeFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.DEAL.DEAL_TYPE;

  const fieldInputs = [
    { text: PRODUCT.BSS_EWCS, value: PRODUCT.BSS_EWCS },
    { text: PRODUCT.GEF, value: PRODUCT.GEF },
  ];

  return generateFiltersArray(fieldName, fieldInputs, submittedFilters);
};

/**
 * Create filters array for the 'status type' field.
 * This will used in the checkboxes component 'items' array.
 */
const statusFilters = (submittedFilters) => {
  const fieldName = FIELD_NAMES.DEAL.STATUS;

  const fieldInputs = [
    {
      text: BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES,
      value: BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES,
    },
    {
      text: DEAL_STATUS.DRAFT,
      value: DEAL_STATUS.DRAFT,
    },
    {
      text: DEAL_STATUS.READY_FOR_APPROVAL,
      value: DEAL_STATUS.READY_FOR_APPROVAL,
    },
    {
      text: DEAL_STATUS.CHANGES_REQUIRED,
      value: DEAL_STATUS.CHANGES_REQUIRED,
    },
    {
      text: DEAL_STATUS.SUBMITTED_TO_UKEF,
      value: DEAL_STATUS.SUBMITTED_TO_UKEF,
    },
    {
      text: DEAL_STATUS.UKEF_ACKNOWLEDGED,
      value: DEAL_STATUS.UKEF_ACKNOWLEDGED,
    },
    {
      text: DEAL_STATUS.IN_PROGRESS_BY_UKEF,
      value: DEAL_STATUS.IN_PROGRESS_BY_UKEF,
    },
    {
      text: DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
      value: DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
    },
    {
      text: DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
      value: DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    },
    {
      text: DEAL_STATUS.UKEF_REFUSED,
      value: DEAL_STATUS.UKEF_REFUSED,
    },
    {
      text: DEAL_STATUS.ABANDONED,
      value: DEAL_STATUS.ABANDONED,
    },
  ];

  if (isTfmDealCancellationFeatureFlagEnabled()) {
    fieldInputs.push({
      text: DEAL_STATUS.CANCELLED,
      value: DEAL_STATUS.CANCELLED,
    });
  }

  return generateFiltersArray(fieldName, fieldInputs, submittedFilters);
};

/**
 * Create an object for all filters.
 * This will used in multiple checkboxes components.
 */
const dealsTemplateFilters = (submittedFilters = {}) => ({
  createdBy: createdByYouFilter(submittedFilters),
  dealType: dealTypeFilters(submittedFilters),
  submissionType: submissionTypeFilters(FIELD_NAMES.DEAL.SUBMISSION_TYPE, submittedFilters),
  status: statusFilters(submittedFilters),
});

module.exports = {
  createdByYouFilter,
  dealTypeFilters,
  statusFilters,
  dealsTemplateFilters,
};
