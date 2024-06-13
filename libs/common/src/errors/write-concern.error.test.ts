import { DatabaseError } from './database.error';
import { WriteConcernError } from './write-concern.error';

describe('WriteConcernError', () => {
  it('exposes the expected message', () => {
    // Arrange
    const expectedMessage = 'The write operation did not succeed';

    // Act
    const exception = new WriteConcernError();

    // Assert
    expect(exception.message).toEqual(expectedMessage);
  });

  it('is an instance of WriteConcernError', () => {
    // Act
    const exception = new WriteConcernError();

    // Assert
    expect(exception).toBeInstanceOf(WriteConcernError);
  });

  it('is an instance of DatabaseError', () => {
    // Act
    const exception = new WriteConcernError();

    // Assert
    expect(exception).toBeInstanceOf(DatabaseError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new WriteConcernError();

    // Assert
    expect(exception.name).toEqual('WriteConcernError');
  });
});
