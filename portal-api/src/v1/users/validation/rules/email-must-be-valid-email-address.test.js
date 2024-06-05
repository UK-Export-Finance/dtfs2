const emailMustBeValidEmailAddress = require('./email-must-be-valid-email-address');

describe('emailMustBeValidEmailAddress', () => {
  const emailMustBeValidEmailAddressError = [
    {
      email: {
        order: '1',
        text: 'Enter an email address in the correct format, for example, name@example.com',
      },
    },
  ];

  const testCases = [
    { description: 'when no existing user is provided', user: undefined },
    { description: 'when an existing user is provided', user: { email: 'aValidEmail@ukexportfinance.gov.uk' } },
  ];
  describe.each(testCases)('$description', ({ user }) => {
    it('should not return error when email is not provided', () => {
      const change = {};
      const errors = emailMustBeValidEmailAddress(user, change);
      expect(errors).toStrictEqual([]);
    });

    it('should not return error when the email is an email address', () => {
      const change = { email: 'aValidEmail@ukexportfinance.gov.uk' };
      const errors = emailMustBeValidEmailAddress(user, change);
      expect(errors).toStrictEqual([]);
    });

    const invalidEmailAddresses = [
      { invalidEmailAddress: '' },
      { invalidEmailAddress: '   ' },
      { invalidEmailAddress: 'a' },
      { invalidEmailAddress: '  a@a.com  ' },
      { invalidEmailAddress: 1 },
      { invalidEmailAddress: { test: 'test' } },
    ];

    it.each(invalidEmailAddresses)('should return error when the email is not an email address', ({ invalidEmailAddress }) => {
      const change = { email: invalidEmailAddress };
      const errors = emailMustBeValidEmailAddress(user, change);
      expect(errors).toStrictEqual(emailMustBeValidEmailAddressError);
    });
  });
});
