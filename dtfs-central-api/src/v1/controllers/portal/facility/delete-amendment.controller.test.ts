import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { TestApiError } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { deletePortalAmendment, DeletePortalAmendmentRequest } from './delete-amendment.controller';

const facilityId = new ObjectId();
const amendmentId = new ObjectId();

const mockDeletePortalFacilityAmendment = jest.fn();
console.error = jest.fn();

const generateHttpMocks = ({ auditDetails }: { auditDetails: unknown }) =>
  createMocks<DeletePortalAmendmentRequest>({ params: { facilityId, amendmentId }, body: { auditDetails } });

describe('deletePortalAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'deletePortalFacilityAmendment').mockImplementation(mockDeletePortalFacilityAmendment);
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

  it('should return the correct status and body if TfmFacilitiesRepo.deletePortalFacilityAmendment throws an api error', async () => {
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

  it(`should return ${HttpStatusCode.InternalServerError} if TfmFacilitiesRepo.deletePortalFacilityAmendment throws an unknown error`, async () => {
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
