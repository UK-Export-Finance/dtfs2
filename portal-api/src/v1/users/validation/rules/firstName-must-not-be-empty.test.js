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

  const inputs = ['', ' ', [], {}];

  describe('firstname validation', () => {
    test.each(inputs)('should return an error when first name is an %s', (input) => {
      const errors = firstNameMustNotBeEmpty(undefined, input);
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
