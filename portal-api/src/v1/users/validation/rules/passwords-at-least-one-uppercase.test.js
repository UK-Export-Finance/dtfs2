const passwordAtLeastOneUppercase = require('./passwordAtLeastOneUppercase');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('at least 1 uppercase', () => {
  it('should return error for passwords without uppercase', () => {
    const change = {
      password: 'aaaaa',
    };

    const expected = [
      {
        password: {
          order: '5',
          text: 'Your password must contain at least one upper-case character.',
        },
      },
    ];

    const result = passwordAtLeastOneUppercase(user, change);
    expect(result).toEqual(expected);
  });

  it('should not return error for passwords with uppercase', () => {
    const change = {
      password: 'Aaaa',
    };

    const result = passwordAtLeastOneUppercase(user, change);
    expect(result).toEqual([]);
  });

  it('should not return error if no change', () => {
    const result = passwordAtLeastOneUppercase(user, '');
    expect(result).toEqual([]);
  });
});
