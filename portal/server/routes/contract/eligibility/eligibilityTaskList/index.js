const eligibilityTaskList = (completedForms) => [
  {
    title: 'Eligibility criteria',
    completed: completedForms.eligibilityCriteria,
    href: '/criteria',
  },
  {
    title: 'Supporting documentation',
    completed: completedForms.supportingDocumentation,
    href: '/supporting-documentation',
  },
];

module.exports = eligibilityTaskList;
