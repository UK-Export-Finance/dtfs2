const passwordAtLeast8Characters = require('../../../../../src/v1/users/validation/rules/passwordAtLeast8Characters');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('at least 8 characters', () => {
  it('should return error for passwords with less than 8 characters', () => {
    const change = {
      password: 'AAAA',
    };

    const expectedResult = [{
      password: {
        order: '1',
        text: 'Your password must contain at least 8 characters.',
      },
    }];

    const matchTest = passwordAtLeast8Characters(user, change);
    expect(matchTest).toEqual(expectedResult);
  });

  it('should not return error for passwords with uppercase', () => {
    const change = {
      password: 'aaaabbbb',
    };

    const matchTest = passwordAtLeast8Characters(user, change);
    expect(matchTest).toEqual([]);
  });

  it('should not return error if no change', () => {
    const matchTest = passwordAtLeast8Characters(user, '');
    expect(matchTest).toEqual([]);
  });
});
