const InvalidSessionIdentierError = require('./invalid-session-identifier.error');

describe('InvalidSessionIdentierError', () => {
  const sessionIdentier = 'exampleSessionIdentier';

  it('exposes the sessionIdentier in a formatted message', () => {
    const exception = new InvalidSessionIdentierError(sessionIdentier);

    expect(exception.message).toBe(`Invalid sessionIdentier: ${sessionIdentier}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidSessionIdentierError(sessionIdentier);

    expect(exception.name).toBe('InvalidSessionIdentierError');
  });
});
