const passwordAtLeastOneSpecialCharacter = require('./passwordAtLeastOneSpecialCharacter');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('at least 1 special character', () => {
  it('should return error for passwords without special character', () => {
    const change = {
      password: 'aaaaa',
    };

    const expected = [
      {
        password: {
          order: '4',
          text: 'Your password must contain at least one special character.',
        },
      },
    ];

    const result = passwordAtLeastOneSpecialCharacter(user, change);
    expect(result).toEqual(expected);
  });

  it('should not return error for passwords with uppercase', () => {
    const change = {
      password: 'Aaaa$',
    };

    const result = passwordAtLeastOneSpecialCharacter(user, change);
    expect(result).toEqual([]);
  });

  it('should not return error if no change', () => {
    const result = passwordAtLeastOneSpecialCharacter(user, '');
    expect(result).toEqual([]);
  });
});
