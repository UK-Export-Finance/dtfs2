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

  const inputs = ['', ' ', [], {}];

  describe('surname validation', () => {
    test.each(inputs)('should return an error when first name is an %s', (input) => {
      const errors = surnameMustNotBeEmpty(undefined, input);
      expect(errors).toStrictEqual(surnameMustNotBeEmptyError);
    });
  });

  describe('when a surname is provided', () => {
    it('should not return an error', () => {
      const surnameChange = { surname: 'Doe' };
      const errors = surnameMustNotBeEmpty(undefined, surnameChange);
      expect(errors).toStrictEqual([]);
    });
  });
});
