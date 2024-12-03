const currentPasswordMustMatch = require('./currentPasswordMustMatch');
const utils = require('../../../../crypto/utils');

const password = 'AbC!2345';

const user = utils.genPassword(password);

const errorResult = [
  {
    currentPassword: {
      order: '7',
      text: 'Current password is not correct.',
    },
  },
];

describe('current password must match', () => {
  it("should return error if current password isn't given", () => {
    const change = {
      currentPassword: '',
      password: 'AAAA',
      passwordConfirm: 'AAAA',
    };

    const result = currentPasswordMustMatch(user, change);
    expect(result).toEqual(errorResult);
  });

  it("should return error if current password doesn't match", () => {
    const change = {
      currentPassword: 'xxxx',
      password: 'AAAA',
      passwordConfirm: 'AAAA',
    };

    const result = currentPasswordMustMatch(user, change);
    expect(result).toEqual(errorResult);
  });

  it('should not return error if current password is valid', () => {
    const change = {
      currentPassword: password,
      password: 'AAAA',
      passwordConfirm: 'AAAA',
    };

    const result = currentPasswordMustMatch(user, change);
    expect(result).toEqual([]);
  });

  it('should not return error if valid reset password token supplied', () => {
    const resetPwdToken = 'validResetToken';

    const change = {
      resetPwdToken,
      password: 'AAAA',
      passwordConfirm: 'AAAA',
    };

    const userWithResetToken = {
      ...user,
      resetPwdToken,
    };
    const result = currentPasswordMustMatch(userWithResetToken, change);
    expect(result).toEqual([]);
  });

  it('should return error if invalid reset password token supplied', () => {
    const resetPwdToken = 'validResetToken';

    const change = {
      resetPwdToken: 'invalidToken',
      password: 'AAAA',
      passwordConfirm: 'AAAA',
    };

    const userWithResetToken = {
      ...user,
      resetPwdToken,
    };
    const result = currentPasswordMustMatch(userWithResetToken, change);
    expect(result).toEqual(errorResult);
  });
});
