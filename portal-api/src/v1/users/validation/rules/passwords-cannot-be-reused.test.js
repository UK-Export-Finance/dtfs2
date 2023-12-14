const utils = require('../../../../crypto/utils');

const passwordsCannotBeReused = require('./passwordsCannotBeReUsed');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('passwords cannot be reused', () => {
  it('should return error for passwords that have already been used', () => {
    const change = {
      password: 'AAAA',
    };

    const { salt, hash } = utils.genPassword(change.password);
    const blockedUser = {
      ...user,
      blockedPasswordList: [
        {
          oldHash: hash,
          oldSalt: salt,
        },
      ],
    };

    const expectedResult = [
      {
        password: {
          order: '6',
          text: 'You cannot re-use old passwords.',
        },
      },
    ];

    const matchTest = passwordsCannotBeReused(blockedUser, change);
    expect(matchTest).toEqual(expectedResult);
  });

  it("should not return error for passwords that haven't been previously used", () => {
    const change = {
      password: 'AAAA',
    };

    const matchTest = passwordsCannotBeReused(user, change);
    expect(matchTest).toEqual([]);
  });

  it('should not return error if no change', () => {
    const matchTest = passwordsCannotBeReused(user, '');
    expect(matchTest).toEqual([]);
  });
});
