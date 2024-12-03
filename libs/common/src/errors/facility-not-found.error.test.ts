import { ApiError } from './api.error';
import { FacilityNotFoundError } from './facility-not-found.error';

describe('FacilityNotFoundError', () => {
  const facilityId = 'Example facility id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new FacilityNotFoundError(facilityId);

    // Assert
    expect(exception.message).toEqual('Facility not found: Example facility id');
  });

  it('has the message "Facility not found" if no facilityId is provided', () => {
    // Act
    const exception = new FacilityNotFoundError();

    // Assert
    expect(exception.message).toEqual('Facility not found');
  });

  it('is an instance of FacilityNotFoundError', () => {
    // Act
    const exception = new FacilityNotFoundError(facilityId);

    // Assert
    expect(exception).toBeInstanceOf(FacilityNotFoundError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new FacilityNotFoundError(facilityId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new FacilityNotFoundError(facilityId);

    // Assert
    expect(exception.name).toEqual('FacilityNotFoundError');
  });
});
