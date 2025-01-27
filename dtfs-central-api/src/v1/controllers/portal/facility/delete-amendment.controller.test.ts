import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE, TestApiError } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { deletePortalAmendment, DeletePortalAmendmentRequest } from './delete-amendment.controller';

const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const mockDeletePortalFacilityAmendment = jest.fn();
console.error = jest.fn();

const generateHttpMocks = ({ auditDetails }: { auditDetails: unknown }) =>
  createMocks<DeletePortalAmendmentRequest>({ params: { facilityId, amendmentId }, body: { auditDetails } });

describe('deleteAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'deletePortalFacilityAmendment').mockImplementation(mockDeletePortalFacilityAmendment);
  });

  it(`should return ${HttpStatusCode.BadRequest} if the audit details are invalid`, async () => {
    // Arrange
    const auditDetails = { type: 'not a type' };
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await deletePortalAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.BadRequest,
      message: "Supplied auditDetails must contain a 'userType' property",
      code: API_ERROR_CODE.INVALID_AUDIT_DETAILS,
    });
  });

  it('should call PortalFacilityAmendmentService.deletePortalFacilityAmendment with the correct params', async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await deletePortalAmendment(req, res);

    // Assert

    expect(mockDeletePortalFacilityAmendment).toHaveBeenCalledTimes(1);
    expect(mockDeletePortalFacilityAmendment).toHaveBeenCalledWith({
      amendmentId,
      facilityId,
      auditDetails,
    });
  });

  it(`should return ${HttpStatusCode.NoContent}`, async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await deletePortalAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.NoContent);
  });

  it('should return the correct status and body if PortalFacilityAmendmentService.deletePortalFacilityAmendment throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockDeletePortalFacilityAmendment.mockRejectedValue(new TestApiError({ status, message }));

    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await deletePortalAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if PortalFacilityAmendmentService.updatePortalFacilityAmendment throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockDeletePortalFacilityAmendment.mockRejectedValue(new Error(message));

    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await deletePortalAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when deleting portal amendment',
    });
  });
});
