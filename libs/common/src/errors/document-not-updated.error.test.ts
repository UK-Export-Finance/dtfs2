import { DocumentNotUpdatedError } from './document-not-updated.error';
import { DatabaseError } from './database.error';

describe('DocumentNotUpdatedError', () => {
  it('exposes the message the error was created with', () => {
    // Act
    const exception = new DocumentNotUpdatedError();

    // Assert
    expect(exception.message).toEqual('Document update failed');
  });

  it('exposes the message the error was created with if a document id is provided', () => {
    // Arrange
    const documentId = '123';

    // Act
    const exception = new DocumentNotUpdatedError(documentId);

    // Assert
    expect(exception.message).toEqual(`Document update failed for document with id: ${documentId}`);
  });

  it('is an instance of DatabaseError', () => {
    // Act
    const exception = new DocumentNotUpdatedError();

    // Assert
    expect(exception).toBeInstanceOf(DatabaseError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new DocumentNotUpdatedError();

    // Assert
    expect(exception.name).toEqual('DocumentNotUpdatedError');
  });
});
