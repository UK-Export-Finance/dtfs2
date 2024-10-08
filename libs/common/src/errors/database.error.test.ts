import { DatabaseError } from './database.error';

describe('DatabaseError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    // Act
    const exception = new DatabaseError(message);

    // Assert
    expect(exception.message).toBe(message);
  });

  it('is an instance of DatabaseError', () => {
    // Act
    const exception = new DatabaseError(message);

    // Assert
    expect(exception).toBeInstanceOf(DatabaseError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new DatabaseError(message);

    // Assert
    expect(exception.name).toEqual('DatabaseError');
  });
});
