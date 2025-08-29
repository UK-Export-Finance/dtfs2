const loanTaskList = (completedForms) => [
  {
    title: 'Loan guarantee details',
    completed: completedForms.loanGuaranteeDetails,
    href: '/guarantee-details',
  },
  {
    title: 'Loan financial details',
    completed: completedForms.loanFinancialDetails,
    href: '/financial-details',
  },
  {
    title: 'Dates and repayments',
    completed: completedForms.loanDatesRepayments,
    href: '/dates-repayments',
  },
];

module.exports = loanTaskList;
