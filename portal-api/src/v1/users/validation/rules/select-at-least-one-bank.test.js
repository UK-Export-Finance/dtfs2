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

  const testCases = [
    { description: 'when no bank is provided', change: { bank: '' } },
    { description: 'when a bank is provided', change: { bank: 'Bank1' } },
  ];

  describe.each(testCases)('$description', ({ change }) => {
    it('should return an error if no bank is selected', () => {
      const errors = selectAtLeastOneBank(undefined, change);
      expect(errors).toStrictEqual(selectAtLeastOneBankError);
    });

    it('should not return an error if a bank is selected', () => {
      const errors = selectAtLeastOneBank(undefined, change);
      expect(errors).toStrictEqual([]);
    });
  });
});