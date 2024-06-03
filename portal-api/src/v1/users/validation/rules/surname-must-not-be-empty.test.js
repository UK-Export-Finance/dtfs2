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

  const testCases = [{ description: 'when no surname is provided', change: { surname: '' } }];

  describe.each(testCases)('$description', ({ change }) => {
    it('should return an error if no surname is provided', () => {
      const errors = surnameMustNotBeEmpty(undefined, change);
      expect(errors).toStrictEqual(surnameMustNotBeEmptyError);
    });

    it('should not return an error if a surname is provided', () => {
      const surnameChange = { surname: 'Doe' };
      const errors = surnameMustNotBeEmpty(undefined, surnameChange);
      expect(errors).toStrictEqual([]);
    });
  });
});
