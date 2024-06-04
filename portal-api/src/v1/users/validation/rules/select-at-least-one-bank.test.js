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

  const testCases = [
    { user: 'user var is not used in this validation case', change: { bank: [], roles: ['any'] }, expected: selectAtLeastOneBankError },
    { user: 'NA', change: { bank: 'all', roles: ['admin'] }, expected: [] },
    { user: 'NA', change: { bank: 'all', roles: ['checker'] }, expected: allBankError },
  ];

  testCases.forEach(({ user, change, expected }) => {
    it(`should return ${expected.length > 0 ? 'an error' : 'no error'} when new user is ${change.roles[0]} and ${
      change.bank.length > 0 ? 'a bank is selected' : 'no bank is selected'
    }`, () => {
      const errors = selectAtLeastOneBank(user, change);
      expect(errors).toStrictEqual(expected);
    });
  });
});
