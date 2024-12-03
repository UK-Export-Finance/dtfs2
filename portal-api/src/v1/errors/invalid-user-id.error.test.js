const InvalidUserIdError = require('./invalid-user-id.error');

describe('InvalidUserIdError', () => {
  const userId = 'exampleId';

  it('exposes the userId in a formatted message', () => {
    const exception = new InvalidUserIdError(userId);

    expect(exception.message).toEqual(`Invalid user ID: ${userId}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidUserIdError(userId);

    expect(exception.name).toEqual('InvalidUserIdError');
  });
});
