import { HttpStatusCode } from 'axios';
import { AmendmentIncompleteError } from './amendment-incomplete.error';
import { ApiError } from './api.error';

describe('AmendmentIncompleteError', () => {
  const facilityId = 'Example facility id';
  const amendmentId = 'Example amendment id';
  const message = 'a message';

  it('should expose the message the error was created with', () => {
    // Act
    const exception = new AmendmentIncompleteError(facilityId, amendmentId, message);

    // Assert
    expect(exception.message).toEqual(`Amendment ${amendmentId} on facility ${facilityId} is incomplete: ${message}`);
  });

  it('should have status 409', () => {
    // Act
    const exception = new AmendmentIncompleteError(facilityId, amendmentId, message);

    // Assert
    expect(exception.status).toEqual(HttpStatusCode.Conflict);
  });

  it('should be an instance of AmendmentIncompleteError', () => {
    // Act
    const exception = new AmendmentIncompleteError(facilityId, amendmentId, message);

    // Assert
    expect(exception).toBeInstanceOf(AmendmentIncompleteError);
  });

  it('should be an instance of ApiError', () => {
    // Act
    const exception = new AmendmentIncompleteError(facilityId, amendmentId, message);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('should expose the name of the exception', () => {
    // Act
    const exception = new AmendmentIncompleteError(facilityId, amendmentId, message);

    // Assert
    expect(exception.name).toEqual('AmendmentIncompleteError');
  });
});
