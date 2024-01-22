const UserDisabledError = require('./user-disabled.error');

describe('UserDisabledError', () => {
  const userId = 'exampleUserId';

  it('exposes the userId in a formatted message', () => {
    const exception = new UserDisabledError(userId);

    expect(exception.message).toBe(`User disabled: ${userId}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new UserDisabledError(userId);

    expect(exception.name).toBe('UserDisabledError');
  });
});
