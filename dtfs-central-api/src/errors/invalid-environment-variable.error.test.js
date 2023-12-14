const { InvalidEnvironmentVariableError } = require('./invalid-environment-variable.error');

describe('InvalidEnvironmentVariableError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    const exception = new InvalidEnvironmentVariableError(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidEnvironmentVariableError(message);

    expect(exception.name).toBe('InvalidEnvironmentVariableError');
  });
});
