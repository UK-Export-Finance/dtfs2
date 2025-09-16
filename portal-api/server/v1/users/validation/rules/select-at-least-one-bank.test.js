const {
  ROLES: { MAKER, CHECKER, ADMIN },
  BANKS,
} = require('@ukef/dtfs2-common');
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
        text: 'Only the admin and read-only user can be allocated to "All" bank',
      },
    },
  ];

  const inputs = [
    { user: 'user var is not used in this validation case', change: { bank: null, roles: [MAKER] }, expected: selectAtLeastOneBankError },
    { user: 'NA', change: { bank: null, roles: [ADMIN] }, expected: selectAtLeastOneBankError },
    { user: 'NA', change: { bank: { name: BANKS.ALL }, roles: [ADMIN] }, expected: [] },
    { user: 'NA', change: { bank: { name: BANKS.ALL }, roles: [CHECKER] }, expected: allBankError },
  ];

  describe('selectAtLeastOneBank validation', () => {
    test.each(inputs)('should return %s when new user is %s and %s', (input) => {
      const errors = selectAtLeastOneBank(input.user, input.change);
      expect(errors).toStrictEqual(input.expected);
    });
  });
});
