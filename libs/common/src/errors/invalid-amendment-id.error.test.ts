import { ApiError } from './api.error';
import { InvalidAmendmentIdError } from './invalid-amendment-id.error';

describe('InvalidAmendmentIdError', () => {
  const amendmentId = 'Example amendment id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new InvalidAmendmentIdError(amendmentId);

    // Assert
    expect(exception.message).toEqual('Invalid amendment ID: Example amendment id');
  });

  it('has the message "Invalid amendment ID" if no amendmentId is provided', () => {
    // Act
    const exception = new InvalidAmendmentIdError();

    // Assert
    expect(exception.message).toEqual('Invalid amendment ID');
  });

  it('is an instance of InvalidAmendmentIdError', () => {
    // Act
    const exception = new InvalidAmendmentIdError(amendmentId);

    // Assert
    expect(exception).toBeInstanceOf(InvalidAmendmentIdError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new InvalidAmendmentIdError(amendmentId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new InvalidAmendmentIdError(amendmentId);

    // Assert
    expect(exception.name).toEqual('InvalidAmendmentIdError');
  });
});
