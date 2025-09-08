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

    const expected = [
      {
        password: {
          order: '6',
          text: 'You cannot re-use old passwords.',
        },
      },
    ];

    const result = passwordsCannotBeReused(blockedUser, change);
    expect(result).toEqual(expected);
  });

  it("should not return error for passwords that haven't been previously used", () => {
    const change = {
      password: 'AAAA',
    };

    const result = passwordsCannotBeReused(user, change);
    expect(result).toEqual([]);
  });

  it('should not return error if no change', () => {
    const result = passwordsCannotBeReused(user, '');
    expect(result).toEqual([]);
  });
});
