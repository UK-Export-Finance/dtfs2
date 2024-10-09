const PageOutOfBoundsError = require('./page-out-of-bounds.error');

describe('PageOutOfBoundsError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    const exception = new PageOutOfBoundsError(message);

    expect(exception.message).toEqual(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new PageOutOfBoundsError(message);

    expect(exception.name).toEqual('PageOutOfBoundsError');
  });
});
