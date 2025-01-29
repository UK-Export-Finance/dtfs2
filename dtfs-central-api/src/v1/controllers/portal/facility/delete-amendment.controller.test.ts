import { ObjectId, UpdateResult } from 'mongodb';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TestApiError } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { deletePortalAmendment, DeletePortalAmendmentRequest } from './delete-amendment.controller';

const facilityId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();

const mockDeletePortalFacilityAmendment = jest.fn() as jest.Mock<Promise<UpdateResult>>;
console.error = jest.fn();

const generateHttpMocks = ({ auditDetails }: { auditDetails: unknown }) =>
  createMocks<DeletePortalAmendmentRequest>({ params: { facilityId, amendmentId }, body: { auditDetails } });

const updateResult = {
  modifiedCount: 1,
  acknowledged: true,
  upsertedId: new ObjectId(facilityId),
  matchedCount: 1,
  upsertedCount: 1,
};

jest.mock('../../../../repositories/tfm-facilities-repo', () => ({
  TfmFacilitiesRepo: {
    deletePortalFacilityAmendment: (amendment: { facilityId: ObjectId; amendmentId: ObjectId; auditDetails: unknown }) =>
      mockDeletePortalFacilityAmendment(amendment),
  },
}));

describe('deletePortalAmendment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call TfmFacilitiesRepo.deletePortalFacilityAmendment with the correct params', async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await deletePortalAmendment(req, res);

    // Assert
    expect(mockDeletePortalFacilityAmendment).toHaveBeenCalledTimes(1);
    expect(mockDeletePortalFacilityAmendment).toHaveBeenCalledWith({
      amendmentId: new ObjectId(amendmentId),
      facilityId: new ObjectId(facilityId),
      auditDetails,
    });
  });

  it(`should throw ${HttpStatusCode.NotFound} if no documents are matched`, async () => {
    // Arrange
    mockDeletePortalFacilityAmendment.mockResolvedValue({ ...updateResult, modifiedCount: 0 });
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await deletePortalAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return ${HttpStatusCode.NoContent}`, async () => {
    // Arrange
    mockDeletePortalFacilityAmendment.mockResolvedValue(updateResult);
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
