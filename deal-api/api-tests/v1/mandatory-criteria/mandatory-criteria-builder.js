module.exports = overrides => ({
  id: '1',
  title: 'Supply contract/Transaction',
  items: [
    {
      id: 1,
      copy: 'The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate.',
    },
    {
      id: 2,
      copy: 'The Bank has complied with its policies and procedures in relation to the Transaction.',
    },
    {
      id: 3,
      copy: 'Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)',
    },
  ],
  ...overrides,
});
