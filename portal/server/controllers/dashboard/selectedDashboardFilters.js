
const generateSelectedFiltersObject = (
  heading,
  fieldName,
  submittedFieldFilters,
) => ({
  heading: {
    text: 'Product',
  },
  items: submittedFieldFilters.map((fieldValue) => ({
    href: '#',
    text: fieldValue,
  })),
});

const selectedDashboardFilters = (submittedFilters) => {
  const selected = [];

  if (submittedFilters.dealType) {
    selected.push(generateSelectedFiltersObject(
      'Product',
      'dealType',
      submittedFilters.dealType,
    ));
  }

  if (submittedFilters.submissionType) {
    selected.push(generateSelectedFiltersObject(
      'Notice type',
      'submissionType',
      submittedFilters.submissionType,
    ));
  }

  if (submittedFilters.status) {
    selected.push(generateSelectedFiltersObject(
      'Status',
      'submissionType',
      submittedFilters.status,
    ));
  }

  return selected;
};

module.exports = {
  selectedDashboardFilters,
};
