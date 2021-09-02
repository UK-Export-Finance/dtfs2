const bondTaskList = (completedForms) => [
  {
    title: 'Bond details',
    completed: completedForms.bondDetails,
    href: '/details',
  },
  {
    title: 'Financial details',
    completed: completedForms.bondFinancialDetails,
    href: '/financial-details',
  },
  {
    title: 'Fee details',
    completed: completedForms.bondFeeDetails,
    href: '/fee-details',
  },
];

module.exports = bondTaskList;
