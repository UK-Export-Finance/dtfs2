const InvalidCollectionNameError = require('./invalid-collection-name.error');

describe('InvalidCollectionNameError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    const exception = new InvalidCollectionNameError(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidCollectionNameError(message);

    expect(exception.name).toBe('InvalidCollectionNameError');
  });
});
