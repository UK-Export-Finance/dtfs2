const passwordAtLeastOneNumber = require('./passwordAtLeastOneNumber');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('at least 1 number', () => {
  it('should return error for passwords without a number', () => {
    const change = {
      password: 'aaaaa',
    };

    const expected = [
      {
        password: {
          order: '3',
          text: 'Your password must contain at least one numeric character.',
        },
      },
    ];

    const matchTest = passwordAtLeastOneNumber(user, change);
    expect(matchTest).toEqual(expected);
  });

  it('should not return error for passwords with a number', () => {
    const change = {
      password: 'Aaaa1',
    };

    const matchTest = passwordAtLeastOneNumber(user, change);
    expect(matchTest).toEqual([]);
  });

  it('should not return error if no change', () => {
    const matchTest = passwordAtLeastOneNumber(user, '');
    expect(matchTest).toEqual([]);
  });
});
