import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, API_ERROR_CODE, TestApiError } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { aPortalUser } from '../../../../../test-helpers';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { patchAmendment, PatchAmendmentRequest } from './patch-amendment.controller';

const facilityId = 'facilityId';
const dealId = 'dealId';
const amendmentId = 'amendmentId';
const amendment = aPortalFacilityAmendmentUserValues();
const type = AMENDMENT_TYPES.PORTAL;
const amendmentStatus = PORTAL_AMENDMENT_STATUS.DRAFT;

const mockUpdatedAmendment = { facilityId, dealId, amendment, type, status: amendmentStatus };

const mockUpdatePortalFacilityAmendment = jest.fn();

const generateHttpMocks = ({ auditDetails }: { auditDetails: unknown }) =>
  createMocks<PatchAmendmentRequest>({ params: { facilityId, amendmentId }, body: { auditDetails, update: aPortalFacilityAmendmentUserValues() } });

describe('patchAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'updatePortalFacilityAmendmentUserValues').mockImplementation(mockUpdatePortalFacilityAmendment);
    mockUpdatePortalFacilityAmendment.mockResolvedValue(mockUpdatedAmendment);
  });

  it(`should return ${HttpStatusCode.BadRequest} if the audit details are invalid`, async () => {
    // Arrange
    const auditDetails = { type: 'not a type' };
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await patchAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.BadRequest,
      message: "Supplied auditDetails must contain a 'userType' property",
      code: API_ERROR_CODE.INVALID_AUDIT_DETAILS,
    });
  });

  it('should call PortalFacilityAmendmentService.updatePortalFacilityAmendment with the correct params', async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await patchAmendment(req, res);

    // Assert

    expect(mockUpdatePortalFacilityAmendment).toHaveBeenCalledTimes(1);
    expect(mockUpdatePortalFacilityAmendment).toHaveBeenCalledWith({
      amendmentId,
      facilityId,
      update: req.body.update,
      auditDetails,
    });
  });

  it(`should return ${HttpStatusCode.Ok} and the updated amendment`, async () => {
    // Arrange
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await patchAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(mockUpdatedAmendment);
  });

  it('should return the correct status and body if PortalFacilityAmendmentService.updatePortalFacilityAmendment throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockUpdatePortalFacilityAmendment.mockRejectedValue(new TestApiError({ status, message }));

    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await patchAmendment(req, res);

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
    mockUpdatePortalFacilityAmendment.mockRejectedValue(new Error(message));

    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails });

    // Act
    await patchAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when updating amendment',
    });
  });
});
