const usernameAndEmailMustMatch = require('./username-and-email-must-match');

describe('usernameAndEmailMustMatch', () => {
  const matching = 'matching@ukexportfinance.gov.uk';
  const nonMatchingUsername = 'nonMatchingUsername@ukexportfinance.gov.uk';
  const nonMatchingEmail = 'nonMatchingEmail@ukexportfinance.gov.uk';

  const usernameAndEmailMustMatchError = [
    {
      email: {
        order: '1',
        text: 'Username and email must match',
      },
    },
  ];

  const testCases = [
    { description: 'when no existing user is provided', user: undefined },
    {
      description: 'when an existing user is provided',
      user: { username: 'aValidEmail@ukexportfinance.gov.uk', email: 'aValidEmail@ukexportfinance.gov.uk' },
    },
  ];

  describe.each(testCases)('$description', ({ user }) => {
    it('should return an error if username is not present and email is present', () => {
      const change = { email: matching };
      const errors = usernameAndEmailMustMatch(user, change);
      expect(errors).toStrictEqual(usernameAndEmailMustMatchError);
    });

    it('should return an error if username is present and email is not present', () => {
      const change = { username: matching };
      const errors = usernameAndEmailMustMatch(user, change);
      expect(errors).toStrictEqual(usernameAndEmailMustMatchError);
    });

    it('should return an error if username does not match email', () => {
      const change = { username: nonMatchingUsername, email: nonMatchingEmail };
      const errors = usernameAndEmailMustMatch(user, change);
      expect(errors).toStrictEqual(usernameAndEmailMustMatchError);
    });

    it('should not return an error if username is not present and email is not present', () => {
      const change = {};
      const errors = usernameAndEmailMustMatch(user, change);
      expect(errors).toStrictEqual([]);
    });

    it('should not return an error if username matches email', () => {
      const change = { username: matching, email: matching };
      const errors = usernameAndEmailMustMatch(user, change);
      expect(errors).toStrictEqual([]);
    });
  });
});
