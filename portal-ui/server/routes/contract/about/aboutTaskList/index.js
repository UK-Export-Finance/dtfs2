const aboutTaskList = (completedForms) => [
  {
    title: 'Supplier and counter-indemnifier/guarantor',
    completed: completedForms.supplierAndGuarantor,
    href: '/supplier',
  },
  {
    title: 'Buyer',
    completed: completedForms.buyer,
    href: '/buyer',
  },
  {
    title: 'Financial information',
    completed: completedForms.financialInformation,
    href: '/financial',
  },
];

module.exports = aboutTaskList;
