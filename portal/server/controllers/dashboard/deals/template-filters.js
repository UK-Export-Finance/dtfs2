const { FIELD_NAMES, PRODUCT, STATUS } = require('../../../constants');
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
      text: STATUS.DEAL.DRAFT,
      value: STATUS.DEAL.DRAFT,
    },
    {
      text: STATUS.DEAL.READY_FOR_APPROVAL,
      value: STATUS.DEAL.READY_FOR_APPROVAL,
    },
    {
      text: STATUS.DEAL.CHANGES_REQUIRED,
      value: STATUS.DEAL.CHANGES_REQUIRED,
    },
    {
      text: STATUS.DEAL.SUBMITTED_TO_UKEF,
      value: STATUS.DEAL.SUBMITTED_TO_UKEF,
    },
    {
      text: STATUS.DEAL.UKEF_ACKNOWLEDGED,
      value: STATUS.DEAL.UKEF_ACKNOWLEDGED,
    },
    {
      text: STATUS.DEAL.IN_PROGRESS_BY_UKEF,
      value: STATUS.DEAL.IN_PROGRESS_BY_UKEF,
    },
    {
      text: STATUS.DEAL.UKEF_APPROVED_WITH_CONDITIONS,
      value: STATUS.DEAL.UKEF_APPROVED_WITH_CONDITIONS,
    },
    {
      text: STATUS.DEAL.UKEF_APPROVED_WITHOUT_CONDITIONS,
      value: STATUS.DEAL.UKEF_APPROVED_WITHOUT_CONDITIONS,
    },
    {
      text: STATUS.DEAL.UKEF_REFUSED,
      value: STATUS.DEAL.UKEF_REFUSED,
    },
    {
      text: STATUS.DEAL.ABANDONED,
      value: STATUS.DEAL.ABANDONED,
    },
  ];

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
