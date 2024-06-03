const firstNameMustNotBeEmpty = require('./firstName-must-not-be-empty');

describe('firstNameMustNotBeEmpty', () => {
  const firstNameMustNotBeEmptyError = [
    {
      firstname: {
        order: '1',
        text: 'First name is required',
      },
    },
  ];

  const testCases = [{ description: 'when no first name is provided', change: { firstName: '' } }];

  describe.each(testCases)('$description', ({ change }) => {
    it('should return an error if no first name is provided', () => {
      const errors = firstNameMustNotBeEmpty(undefined, change);
      expect(errors).toStrictEqual(firstNameMustNotBeEmptyError);
    });
  });

  describe('when a first name is provided', () => {
    it('should not return an error', () => {
      const firstnameChange = { firstname: 'John' };
      const errors = firstNameMustNotBeEmpty(undefined, firstnameChange);
      expect(errors).toStrictEqual([]);
    });
  });
});
