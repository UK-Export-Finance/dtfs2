const passwordAtLeastOneLowercase = require('./passwordAtLeastOneLowercase');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('at least 1 lowercase', () => {
  it('should return error for passwords without lowercase', () => {
    const change = {
      password: 'AAAA',
    };

    const expected = [
      {
        password: {
          order: '2',
          text: 'Your password must contain at least one lower-case character.',
        },
      },
    ];

    const result = passwordAtLeastOneLowercase(user, change);
    expect(result).toEqual(expected);
  });

  it('should not return error for passwords with uppercase', () => {
    const change = {
      password: 'Aaaa',
    };

    const result = passwordAtLeastOneLowercase(user, change);
    expect(result).toEqual([]);
  });

  it('should not return error if no change', () => {
    const result = passwordAtLeastOneLowercase(user, '');
    expect(result).toEqual([]);
  });
});
