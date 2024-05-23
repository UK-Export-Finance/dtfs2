const firstNameMustNotBeEmpty = require('./firstName-must-not-be-empty');

describe('firstNameMustNotBeEmpty', () => {
  const firstNameMustNotBeEmptyError = [
    {
      firstName: {
        order: '1',
        text: 'First name is required',
      },
    },
  ];

  const testCases = [
    { description: 'when no first name is provided', change: { firstName: '' } },
    { description: 'when a first name is provided', change: { firstName: 'John' } },
  ];

  describe.each(testCases)('$description', ({ change }) => {
    it('should return an error if no first name is provided', () => {
      const errors = firstNameMustNotBeEmpty(undefined, change);
      expect(errors).toStrictEqual(firstNameMustNotBeEmptyError);
    });

    it('should not return an error if a first name is provided', () => {
      const errors = firstNameMustNotBeEmpty(undefined, change);
      expect(errors).toStrictEqual([]);
    });
  });
});