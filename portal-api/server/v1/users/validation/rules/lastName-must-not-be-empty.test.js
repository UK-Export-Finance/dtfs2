const lastNameMustNotBeEmpty = require('./lastName-must-not-be-empty');

describe('lastNameMustNotBeEmpty', () => {
  const lastNameMustNotBeEmptyError = [
    {
      lastName: {
        order: '2',
        text: 'Last name is required',
      },
    },
  ];

  const inputs = ['', ' ', [], {}];

  describe('last name validation', () => {
    test.each(inputs)('should return an error when last name is an %s', (input) => {
      const errors = lastNameMustNotBeEmpty(undefined, input);
      expect(errors).toStrictEqual(lastNameMustNotBeEmptyError);
    });
  });

  describe('when a last name is provided', () => {
    it('should not return an error', () => {
      const lastNameChange = { lastName: 'Doe' };
      const errors = lastNameMustNotBeEmpty(undefined, lastNameChange);
      expect(errors).toStrictEqual([]);
    });
  });
});
