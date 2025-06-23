import { ObjectId } from 'mongodb';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TestApiError, AnyObject, portalAmendmentDeleteEmailVariables, PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { deletePortalAmendment, DeletePortalAmendmentRequest } from './delete-amendment.controller';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import externalApi from '../../../../external-api/api';

const facilityId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();

const mockDeletePortalFacilityAmendment = jest.fn();
const mockfindOneAmendmentByFacilityIdAndAmendmentId = jest.fn();

const mockAmendment = { facilityId, type: AMENDMENT_TYPES.PORTAL, status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED };
console.error = jest.fn();
const sendEmailSpy = jest.fn();

const generateHttpMocks = ({ auditDetails, emailVariables }: { auditDetails: unknown; emailVariables: AnyObject }) =>
  createMocks<DeletePortalAmendmentRequest>({ params: { facilityId, amendmentId }, body: { auditDetails, ...emailVariables } });

const mockPortalAmendmentDeleteEmailVariables = portalAmendmentDeleteEmailVariables();

describe('deletePortalAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findOneAmendmentByFacilityIdAndAmendmentId').mockImplementation(mockfindOneAmendmentByFacilityIdAndAmendmentId);
    jest.spyOn(TfmFacilitiesRepo, 'deletePortalFacilityAmendment').mockImplementation(mockDeletePortalFacilityAmendment);

    mockfindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(mockAmendment);
    externalApi.sendEmail = sendEmailSpy;
  });

  it('should call TfmFacilitiesRepo.deletePortalFacilityAmendment with the correct params', async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails, emailVariables: mockPortalAmendmentDeleteEmailVariables });

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

  it(`should return ${HttpStatusCode.NoContent}`, async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails, emailVariables: mockPortalAmendmentDeleteEmailVariables });

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
    const { req, res } = generateHttpMocks({ auditDetails, emailVariables: mockPortalAmendmentDeleteEmailVariables });

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
    const { req, res } = generateHttpMocks({ auditDetails, emailVariables: mockPortalAmendmentDeleteEmailVariables });

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
