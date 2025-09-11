const InvalidUsernameError = require('./invalid-username.error');

describe('InvalidUsernameError', () => {
  const username = 'exampleUsername';

  it('exposes the username in a formatted message', () => {
    const exception = new InvalidUsernameError(username);

    expect(exception.message).toEqual(`Invalid username: ${username}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidUsernameError(username);

    expect(exception.name).toEqual('InvalidUsernameError');
  });
});
