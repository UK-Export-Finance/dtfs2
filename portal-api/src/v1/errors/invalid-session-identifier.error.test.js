const InvalidSessionIdentifierError = require('./invalid-session-identifier.error');

describe('InvalidSessionIdentifierError', () => {
  const sessionIdentier = 'exampleSessionIdentier';

  it('exposes the sessionIdentier in a formatted message', () => {
    const exception = new InvalidSessionIdentifierError(sessionIdentier);

    expect(exception.message).toBe(`Invalid sessionIdentier: ${sessionIdentier}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidSessionIdentifierError(sessionIdentier);

    expect(exception.name).toBe('InvalidSessionIdentifierError');
  });
});
