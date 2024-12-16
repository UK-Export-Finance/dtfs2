import { AmendmentNotFoundError } from './amendment-not-found.error';
import { ApiError } from './api.error';

describe('AmendmentNotFoundError', () => {
  const facilityId = 'Example facility id';
  const amendmentId = 'Example amendment id';

  it('should expose the message the error was created with', () => {
    // Act
    const exception = new AmendmentNotFoundError(amendmentId, facilityId);

    // Assert
    expect(exception.message).toEqual(`Amendment not found: ${amendmentId} on facility: ${facilityId}`);
  });

  it('should be an instance of AmendmentNotFoundError', () => {
    // Act
    const exception = new AmendmentNotFoundError(amendmentId, facilityId);

    // Assert
    expect(exception).toBeInstanceOf(AmendmentNotFoundError);
  });

  it('should be an instance of ApiError', () => {
    // Act
    const exception = new AmendmentNotFoundError(amendmentId, facilityId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('should expose the name of the exception', () => {
    // Act
    const exception = new AmendmentNotFoundError(amendmentId, facilityId);

    // Assert
    expect(exception.name).toEqual('AmendmentNotFoundError');
  });
});
