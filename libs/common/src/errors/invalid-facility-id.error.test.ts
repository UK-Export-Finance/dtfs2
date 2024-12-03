import { ApiError } from './api.error';
import { InvalidFacilityIdError } from './invalid-facility-id.error';

describe('InvalidFacilityIdError', () => {
  const facilityId = 'Example facility id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new InvalidFacilityIdError(facilityId);

    // Assert
    expect(exception.message).toEqual('Invalid facility ID: Example facility id');
  });

  it('has the message "Invalid facility ID" if no facilityId is provided', () => {
    // Act
    const exception = new InvalidFacilityIdError();

    // Assert
    expect(exception.message).toEqual('Invalid facility ID');
  });

  it('is an instance of InvalidFacilityIdError', () => {
    // Act
    const exception = new InvalidFacilityIdError(facilityId);

    // Assert
    expect(exception).toBeInstanceOf(InvalidFacilityIdError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new InvalidFacilityIdError(facilityId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new InvalidFacilityIdError(facilityId);

    // Assert
    expect(exception.name).toEqual('InvalidFacilityIdError');
  });
});
