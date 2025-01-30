import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { PortalFacilityAmendmentConflictError } from './portal-facility-amendment-conflict.error';

describe('PortalFacilityAmendmentConflictError', () => {
  const dealId = 'Example deal id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError(dealId);

    // Assert
    expect(exception.message).toEqual('There is already a portal facility amendment under way on deal Example deal id');
  });

  it('has the default message if no dealId is provided', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError();

    // Assert
    expect(exception.message).toEqual('There is already a portal facility amendment under way on the deal');
  });

  it('has status 409', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError();

    // Assert
    expect(exception.status).toEqual(HttpStatusCode.Conflict);
  });

  it('is an instance of PortalFacilityAmendmentConflictError', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError(dealId);

    // Assert
    expect(exception).toBeInstanceOf(PortalFacilityAmendmentConflictError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError(dealId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new PortalFacilityAmendmentConflictError(dealId);

    // Assert
    expect(exception.name).toEqual('PortalFacilityAmendmentConflictError');
  });
});
