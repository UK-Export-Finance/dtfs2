const {
  FIELD_NAMES,
  PRODUCT,
  STATUS,
} = require('../../../constants');
const CONTENT_STRINGS = require('../../../content-strings');
const {
  generateFiltersArray,
  submissionTypeFilters,
} = require('../filters/generate-template-filters');

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
      text: CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES,
      value: CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES,
    },
    {
      text: STATUS.DRAFT,
      value: STATUS.DRAFT,
    },
    {
      text: STATUS.READY_FOR_APPROVAL,
      value: STATUS.READY_FOR_APPROVAL,
    },
    {
      text: STATUS.CHANGES_REQUIRED,
      value: STATUS.CHANGES_REQUIRED,
    },
    {
      text: STATUS.SUBMITTED_TO_UKEF,
      value: STATUS.SUBMITTED_TO_UKEF,
    },
    {
      text: STATUS.UKEF_ACKNOWLEDGED,
      value: STATUS.UKEF_ACKNOWLEDGED,
    },
    {
      text: STATUS.IN_PROGRESS_BY_UKEF,
      value: STATUS.IN_PROGRESS_BY_UKEF,
    },
    {
      text: STATUS.UKEF_APPROVED_WITH_CONDITIONS,
      value: STATUS.UKEF_APPROVED_WITH_CONDITIONS,
    },
    {
      text: STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
      value: STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    },
    {
      text: STATUS.UKEF_REFUSED,
      value: STATUS.UKEF_REFUSED,
    },
    {
      text: STATUS.ABANDONED,
      value: STATUS.ABANDONED,
    },
  ];

  return generateFiltersArray(fieldName, fieldInputs, submittedFilters);
};

/**
 * Create an object for all filters.
 * This will used in multiple checkboxes components.
 */
const dealsTemplateFilters = (submittedFilters = {}) => ({
  dealType: dealTypeFilters(submittedFilters),
  submissionType: submissionTypeFilters(
    FIELD_NAMES.DEAL.SUBMISSION_TYPE,
    submittedFilters,
  ),
  status: statusFilters(submittedFilters),
});

module.exports = {
  dealTypeFilters,
  statusFilters,
  dealsTemplateFilters,
};
