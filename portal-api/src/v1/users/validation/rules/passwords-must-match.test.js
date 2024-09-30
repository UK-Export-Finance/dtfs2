const passwordsMustMatch = require('./passwordsMustMatch');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('passwords must match', () => {
  it("should return error for passwords that don't match", () => {
    const change = {
      password: 'AAAA',
      passwordConfirm: 'BBBB',
    };

    const expected = [
      {
        passwordConfirm: {
          order: '1',
          text: 'Your passwords must match.',
        },
      },
    ];

    const result = passwordsMustMatch(user, change);
    expect(result).toEqual(expected);
  });

  it('should not return error for passwords match', () => {
    const change = {
      password: 'AAAA',
      passwordConfirm: 'AAAA',
    };

    const result = passwordsMustMatch(user, change);
    expect(result).toEqual([]);
  });

  it('should not return error if no change', () => {
    const result = passwordsMustMatch(user, '');
    expect(result).toEqual([]);
  });
});
