const passwordsMustMatch = require('../../../../../src/v1/users/validation/rules/passwordsMustMatch');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('passwords must match', () => {
  it('should return error for passwords that don\'t match', () => {
    const change = {
      password: 'AAAA',
      passwordConfirm: 'BBBB',
    };

    const expectedResult = [{
      passwordConfirm: {
        order: '1',
        text: 'Your passwords must match.',
      },
    }];

    const matchTest = passwordsMustMatch(user, change);
    expect(matchTest).toEqual(expectedResult);
  });

  it('should not return error for passwords match', () => {
    const change = {
      password: 'AAAA',
      passwordConfirm: 'AAAA',
    };

    const matchTest = passwordsMustMatch(user, change);
    expect(matchTest).toEqual([]);
  });

  it('should not return error if no change', () => {
    const matchTest = passwordsMustMatch(user, '');
    expect(matchTest).toEqual([]);
  });
});
