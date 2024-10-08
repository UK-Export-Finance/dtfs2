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

    const expectedResult = [
      {
        password: {
          order: '2',
          text: 'Your password must contain at least one lower-case character.',
        },
      },
    ];

    const matchTest = passwordAtLeastOneLowercase(user, change);
    expect(matchTest).toEqual(expectedResult);
  });

  it('should not return error for passwords with uppercase', () => {
    const change = {
      password: 'Aaaa',
    };

    const matchTest = passwordAtLeastOneLowercase(user, change);
    expect(matchTest).toEqual([]);
  });

  it('should not return error if no change', () => {
    const matchTest = passwordAtLeastOneLowercase(user, '');
    expect(matchTest).toEqual([]);
  });
});
