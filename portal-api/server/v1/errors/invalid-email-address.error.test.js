const InvalidEmailAddressError = require('./invalid-email-address.error');

describe('InvalidEmailAddressError', () => {
  const email = 'exampleInvalidEmail';

  it('exposes the email in a formatted message', () => {
    const exception = new InvalidEmailAddressError(email);

    expect(exception.message).toEqual(`Invalid email address: ${email}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidEmailAddressError(email);

    expect(exception.name).toEqual('InvalidEmailAddressError');
  });
});
