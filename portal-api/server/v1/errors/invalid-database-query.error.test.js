const { InvalidDatabaseQueryError } = require('./invalid-database-query.error');

describe('InvalidDatabaseQueryError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    const exception = new InvalidDatabaseQueryError(message);

    expect(exception.message).toEqual(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidDatabaseQueryError(message);

    expect(exception.name).toEqual('InvalidDatabaseQueryError');
  });
});
