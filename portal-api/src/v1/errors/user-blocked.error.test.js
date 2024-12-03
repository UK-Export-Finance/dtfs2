const UserBlockedError = require('./user-blocked.error');

describe('UserBlockedError', () => {
  const userId = 'exampleUserId';

  it('exposes the userId in a formatted message', () => {
    const exception = new UserBlockedError(userId);

    expect(exception.message).toEqual(`User blocked: ${userId}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new UserBlockedError(userId);

    expect(exception.name).toEqual('UserBlockedError');
  });
});
