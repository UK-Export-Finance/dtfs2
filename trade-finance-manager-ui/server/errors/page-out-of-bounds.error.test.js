const PageOutOfBoundsError = require("./page-out-of-bounds.error");

describe('InvalidEnvironmentVariableError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    const exception = new PageOutOfBoundsError(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new PageOutOfBoundsError(message);

    expect(exception.name).toBe('PageOutOfBoundsError');
  });
});
