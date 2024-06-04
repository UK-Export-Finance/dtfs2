const surnameMustNotBeEmpty = require('./surname-must-not-be-empty');

describe('surnameMustNotBeEmpty', () => {
  const surnameMustNotBeEmptyError = [
    {
      surname: {
        order: '2',
        text: 'Surname is required',
      },
    },
  ];

  const testCases = [
    { description: 'when no surname is provided', change: { surname: '' } },
    { description: 'when surname is null', change: { surname: null } },
    { description: 'when surname is undefined', change: { surname: undefined } },
    { description: 'when surname is an empty array', change: { surname: [] } },
    { description: 'when surname is an empty object', change: { surname: {} } },
    { description: 'when surname is a space', change: { surname: ' ' } },
  ];

  describe.each(testCases)('$description', ({ change }) => {
    it('should return an error if no surname is provided', () => {
      const errors = surnameMustNotBeEmpty(undefined, change);
      expect(errors).toStrictEqual(surnameMustNotBeEmptyError);
    });

    describe('when a surname is provided', () => {
      it('should not return an error', () => {
        const surnameChange = { surname: 'Doe' };
        const errors = surnameMustNotBeEmpty(undefined, surnameChange);
        expect(errors).toStrictEqual([]);
      });
    });
  });
});
