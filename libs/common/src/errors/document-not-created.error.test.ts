import { DocumentNotCreatedError } from './document-not-created.error';
import { DatabaseError } from './database.error';

describe('DocumentNotCreatedError', () => {
  it('exposes the message the error was created with', () => {
    // Act
    const exception = new DocumentNotCreatedError();

    // Assert
    expect(exception.message).toEqual('Document not created');
  });

  it('is an instance of DatabaseError', () => {
    // Act
    const exception = new DocumentNotCreatedError();

    // Assert
    expect(exception).toBeInstanceOf(DatabaseError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new DocumentNotCreatedError();

    // Assert
    expect(exception.name).toEqual('DocumentNotCreatedError');
  });
});
