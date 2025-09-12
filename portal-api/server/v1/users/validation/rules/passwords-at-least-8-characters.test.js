const passwordAtLeast8Characters = require('./passwordAtLeast8Characters');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('at least 8 characters', () => {
  it('should return error for passwords with less than 8 characters', () => {
    const change = {
      password: '1234',
    };

    const expected = [
      {
        password: {
          order: '1',
          text: 'Your password must contain at least 8 characters.',
        },
      },
    ];

    const result = passwordAtLeast8Characters(user, change);
    expect(result).toEqual(expected);
  });

  it('should not return error for passwords with 8 characters', () => {
    const change = {
      password: '12345678',
    };

    const result = passwordAtLeast8Characters(user, change);
    expect(result).toEqual([]);
  });

  it('should not return error if no change', () => {
    const result = passwordAtLeast8Characters(user, '');
    expect(result).toEqual([]);
  });
});
