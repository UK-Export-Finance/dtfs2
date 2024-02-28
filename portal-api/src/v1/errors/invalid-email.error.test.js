const InvalidEmailError = require('./invalid-email.error');

describe('InvalidEmailError', () => {
  const email = 'exampleInvalidEmail';

  it('exposes the email in a formatted message', () => {
    const exception = new InvalidEmailError(email);

    expect(exception.message).toBe(`Invalid email: ${email}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidEmailError(email);

    expect(exception.name).toBe('InvalidEmailError');
  });
});
