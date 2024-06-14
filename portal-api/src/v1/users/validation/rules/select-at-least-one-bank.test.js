const selectAtLeastOneBank = require('./select-at-least-one-bank');

describe('selectAtLeastOneBank', () => {
  const selectAtLeastOneBankError = [
    {
      bank: {
        order: '4',
        text: 'Bank is required',
      },
    },
  ];

  const allBankError = [
    {
      bank: {
        order: '4',
        text: 'Only admins can have "All" as the bank',
      },
    },
  ];

  const inputs = [
    { user: 'user var is not used in this validation case', change: { bank: null, roles: ['maker'] }, expected: selectAtLeastOneBankError },
    { user: 'NA', change: { bank: 'all', roles: ['admin'] }, expected: [] },
    { user: 'NA', change: { bank: 'all', roles: ['checker'] }, expected: allBankError },
  ];

  describe('selectAtLeastOneBank validation', () => {
    test.each(inputs)('should return %s when new user is %s and %s', (input) => {
      const errors = selectAtLeastOneBank(input.user, input.change);
      expect(errors).toStrictEqual(input.expected);
    });
  });
});
