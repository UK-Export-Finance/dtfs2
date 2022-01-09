const {
  PRODUCT,
  SUBMISSION_TYPE,  
  STATUS,
} = require('../../constants');

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

  return {
    value,
    text: value,
    checked,
  };
};

const generateFiltersArray = (fieldName, fieldValues, submittedFilters) => {
  const filtersArray = fieldValues.map((fieldValue) =>
    generateFilterObject(
      fieldName,
      fieldValue,
      submittedFilters,
    ));

  return filtersArray;
};

const productFilters = (submittedFilters) => {
  const fieldName = 'dealType';

  const fieldValues = [
    PRODUCT.BSS_EWCS,
    PRODUCT.GEF,
  ];

  return generateFiltersArray(fieldName, fieldValues, submittedFilters);
};

const submissionTypeFilters = (submittedFilters) => {
  const fieldName = 'submissionType';

  const fieldValues = [
    SUBMISSION_TYPE.AIN,
    SUBMISSION_TYPE.MIA,
    SUBMISSION_TYPE.MIN,
  ];

  return generateFiltersArray(fieldName, fieldValues, submittedFilters);
};

const statusFilters = (submittedFilters) => {
  const fieldName = 'status';

  const fieldValues = [
    'All statuses',
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

const dashboardFilters = (submittedFilters = {}) => ({
  product: productFilters(submittedFilters),
  submissionType: submissionTypeFilters(submittedFilters),
  status: statusFilters(submittedFilters),
});

const selectedDashboardFilters = (submittedFilters) => {
  const selected = [];

  if (submittedFilters.dealType) {
    selected.push({
      heading: {
        text: 'Product',
      },
      items: submittedFilters.dealType.map((value) => ({
        href: '#',
        text: value,
      })),
    })
  }

  if (submittedFilters.submissionType) {
    selected.push({
      heading: {
        text: 'Notice type',
      },
      items: submittedFilters.submissionType.map((value) => ({
        href: '#',
        text: value,
      })),
    })
  }

  if (submittedFilters.status) {
    selected.push({
      heading: {
        text: 'Status',
      },
      items: submittedFilters.status.map((value) => ({
        href: '#',
        text: value,
      })),
    })
  }

  return selected;
};

module.exports = {
  generateFilterObject,
  dashboardFilters,
  selectedDashboardFilters,
};
