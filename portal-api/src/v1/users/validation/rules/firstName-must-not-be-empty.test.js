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

  const testCases = [
    { description: 'when no first name is provided', change: { firstName: '' } },
    { description: 'when first name is null', change: { firstName: null } },
    { description: 'when first name is undefined', change: { firstName: undefined } },
    { description: 'when first name is an empty array', change: { firstName: [] } },
    { description: 'when first name is an empty object', change: { firstName: {} } },
    { description: 'when first name is a space', change: { firstName: ' ' } },
  ];

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
