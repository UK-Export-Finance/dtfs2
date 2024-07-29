import { ApiError } from './api.error';
import { AmendmentNotCreatedError } from './amendment-not-created.error';

describe('AmendmentNotCreatedError', () => {
  const facilityId = 'Example facility id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new AmendmentNotCreatedError(facilityId);

    // Assert
    expect(exception.message).toEqual('Amendment not created for facility: Example facility id');
  });

  it('has the message "Amendment not created" if no facilityId is provided', () => {
    // Act
    const exception = new AmendmentNotCreatedError();

    // Assert
    expect(exception.message).toEqual('Amendment not created');
  });

  it('is an instance of AmendmentNotCreatedError', () => {
    // Act
    const exception = new AmendmentNotCreatedError(facilityId);

    // Assert
    expect(exception).toBeInstanceOf(AmendmentNotCreatedError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new AmendmentNotCreatedError(facilityId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new AmendmentNotCreatedError(facilityId);

    // Assert
    expect(exception.name).toEqual('AmendmentNotCreatedError');
  });
});
