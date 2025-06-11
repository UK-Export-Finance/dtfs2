import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { PortalFacilityAmendmentConflictError } from './portal-facility-amendment-conflict.error';

describe('PortalFacilityAmendmentConflictError', () => {
  const facilityId = 'Example facility id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError(facilityId);

    // Assert
    expect(exception.message).toEqual(`There is already a portal facility amendment in progress for the given facility ${facilityId}`);
  });

  it('has the default message if no dealId is provided', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError();

    // Assert
    expect(exception.message).toEqual('There is already a portal facility amendment in progress for the given facility');
  });

  it('has status 409', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError();

    // Assert
    expect(exception.status).toEqual(HttpStatusCode.Conflict);
  });

  it('is an instance of PortalFacilityAmendmentConflictError', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError(facilityId);

    // Assert
    expect(exception).toBeInstanceOf(PortalFacilityAmendmentConflictError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError(facilityId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError(facilityId);

    // Assert
    expect(exception.name).toEqual('PortalFacilityAmendmentConflictError');
  });
});
