import { createMocks } from 'node-mocks-http';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, API_ERROR_CODE, TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { patchAmendmentStatus, PatchSubmitAmendmentToCheckerRequest } from './patch-amendment-status.controller';

const amendmentId = 'amendmentId';
const facilityId = 'facilityId';
const dealId = 'dealId';

const mockUpdatedAmendment = { facilityId, dealId, type: AMENDMENT_TYPES.PORTAL, status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL };

const mockSubmitPortalFacilityAmendmentToChecker = jest.fn();

const generateHttpMocks = ({ auditDetails, newStatus }: { auditDetails: unknown; newStatus: string }) =>
  createMocks<PatchSubmitAmendmentToCheckerRequest>({
    params: { facilityId, amendmentId },
    body: { auditDetails, dealId, newStatus },
  });

describe('patchAmendmentStatus', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'submitPortalFacilityAmendmentToChecker').mockImplementation(mockSubmitPortalFacilityAmendmentToChecker);
    mockSubmitPortalFacilityAmendmentToChecker.mockResolvedValue(mockUpdatedAmendment);
  });

  it(`should return ${HttpStatusCode.BadRequest} if the audit details are invalid`, async () => {
    // Arrange
    const auditDetails = { type: 'not a type' };
    const { req, res } = generateHttpMocks({ auditDetails, newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL });

    // Act
    await patchAmendmentStatus(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.BadRequest,
      message: "Supplied auditDetails must contain a 'userType' property",
      code: API_ERROR_CODE.INVALID_AUDIT_DETAILS,
    });
  });

  it(`should return ${HttpStatusCode.BadRequest} if the new status is invalid`, async () => {
    // Arrange
    const invalidNewStatus = 'invalid status';
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
    const { req, res } = generateHttpMocks({ auditDetails, newStatus: invalidNewStatus });

    // Act
    await patchAmendmentStatus(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.BadRequest,
      message: `Invalid requested status update: ${invalidNewStatus}`,
    });
  });

  describe(`when the newStatus is ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, () => {
    const newStatus = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;

    it('should call PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker with the correct params', async () => {
      // Arrange
      const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
      const { req, res } = generateHttpMocks({ auditDetails, newStatus });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert

      expect(mockSubmitPortalFacilityAmendmentToChecker).toHaveBeenCalledTimes(1);
      expect(mockSubmitPortalFacilityAmendmentToChecker).toHaveBeenCalledWith({ facilityId, amendmentId, dealId, auditDetails });
    });

    it(`should return ${HttpStatusCode.Ok} and the updated amendment`, async () => {
      // Arrange
      const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
      const { req, res } = generateHttpMocks({ auditDetails, newStatus });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockUpdatedAmendment);
    });

    it('should return the correct status and body if PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker throws an api error', async () => {
      // Arrange
      const status = HttpStatusCode.Forbidden;
      const message = 'Test error message';
      mockSubmitPortalFacilityAmendmentToChecker.mockRejectedValue(new TestApiError({ status, message }));

      const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
      const { req, res } = generateHttpMocks({ auditDetails, newStatus });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(status);
      expect(res._getData()).toEqual({
        status,
        message,
      });
    });

    it(`should return ${HttpStatusCode.InternalServerError} if PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker throws an unknown error`, async () => {
      // Arrange
      const message = 'Test error message';
      mockSubmitPortalFacilityAmendmentToChecker.mockRejectedValue(new Error(message));

      const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
      const { req, res } = generateHttpMocks({ auditDetails, newStatus });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({
        status: HttpStatusCode.InternalServerError,
        message: 'Unknown error occurred when updating portal amendment status',
      });
    });
  });
});
