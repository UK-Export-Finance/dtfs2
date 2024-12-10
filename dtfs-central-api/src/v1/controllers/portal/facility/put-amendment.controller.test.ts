import { createMocks } from 'node-mocks-http';
import { AMENDMENT_STATUS, AMENDMENT_TYPES, API_ERROR_CODE, TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { putAmendmentDraft, PutAmendmentRequest } from './put-amendment.controller';
import { aPortalUser } from '../../../../../test-helpers';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';

const facilityId = 'facilityId';
const dealId = 'dealId';
const amendment = {
  changeFacilityValue: true,
};

const mockUpsertedAmendment = { facilityId, dealId, amendment, type: AMENDMENT_TYPES.PORTAL, status: AMENDMENT_STATUS.IN_PROGRESS };

const mockUpsertPortalFacilityAmendmentDraft = jest.fn();

const generateHttpMocks = ({ auditDetails }: { auditDetails: unknown }) =>
  createMocks<PutAmendmentRequest>({ params: { facilityId }, body: { auditDetails, amendment, dealId } });

describe('putAmendmentDraft', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'upsertPortalFacilityAmendmentDraft').mockImplementation(mockUpsertPortalFacilityAmendmentDraft);
    mockUpsertPortalFacilityAmendmentDraft.mockResolvedValue(mockUpsertedAmendment);
  });

  it('should return 400 if the audit details are invalid', async () => {
    // Arrange
    const auditDetails = { type: 'not a type' };
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await putAmendmentDraft(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.BadRequest,
      message: "Supplied auditDetails must contain a 'userType' property",
      code: API_ERROR_CODE.INVALID_AUDIT_DETAILS,
    });
  });

  it('should call PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft with the correct params', async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await putAmendmentDraft(req, res);

    // Assert

    expect(mockUpsertPortalFacilityAmendmentDraft).toHaveBeenCalledTimes(1);
    expect(mockUpsertPortalFacilityAmendmentDraft).toHaveBeenCalledWith({
      dealId,
      facilityId,
      amendment,
      auditDetails,
    });
  });

  it('should return the upserted amendment', async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await putAmendmentDraft(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(mockUpsertedAmendment);
  });

  it('should return the correct status and body if PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockUpsertPortalFacilityAmendmentDraft.mockRejectedValue(new TestApiError({ status, message }));

    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await putAmendmentDraft(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it('should return 500 if PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft throws an unknown error', async () => {
    // Arrange
    const message = 'Test error message';
    mockUpsertPortalFacilityAmendmentDraft.mockRejectedValue(new Error(message));

    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await putAmendmentDraft(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when upserting amendment',
    });
  });
});
