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

    const expectedResult = [
      {
        password: {
          order: '4',
          text: 'Your password must contain at least one special character.',
        },
      },
    ];

    const matchTest = passwordAtLeastOneSpecialCharacter(user, change);
    expect(matchTest).toEqual(expectedResult);
  });

  it('should not return error for passwords with uppercase', () => {
    const change = {
      password: 'Aaaa$',
    };

    const matchTest = passwordAtLeastOneSpecialCharacter(user, change);
    expect(matchTest).toEqual([]);
  });

  it('should not return error if no change', () => {
    const matchTest = passwordAtLeastOneSpecialCharacter(user, '');
    expect(matchTest).toEqual([]);
  });
});
