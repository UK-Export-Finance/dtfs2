const UserNotFoundError = require('./user-not-found.error');

describe('UserNotFoundError', () => {
  const userIdentifier = 'exampleIdOrName';

  it('exposes the userIdentifier in a formated message', () => {
    const exception = new UserNotFoundError({ userIdentifier });

    expect(exception.message).toBe(`Failed to find user: ${userIdentifier}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new UserNotFoundError({ userIdentifier });

    expect(exception.name).toBe('UserNotFoundError');
  });

  it('exposes the cause if a cause is provided', () => {
    const cause = 'exampleCause';
    const exception = new UserNotFoundError({ userIdentifier, cause });

    expect(exception.cause).toBe(cause);
  });

  it('does not expose a cause if a cause is not provided', () => {
    const exception = new UserNotFoundError({ userIdentifier });

    expect(exception.cause).toBeUndefined();
  });
});
