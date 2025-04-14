import { createMocks } from 'node-mocks-http';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, API_ERROR_CODE, TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { patchSubmitAmendment, PatchSubmitAmendmentToUkefRequest } from './patch-submit-amendment.controller';

const amendmentId = 'amendmentId';
const facilityId = '6597dffeb5ef5ff4267e5044';
const testReferenceNumber = `${facilityId}-01`;

const mockUpdatedAmendment = { facilityId, type: AMENDMENT_TYPES.PORTAL, status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED };

const mockSubmitPortalFacilityAmendmentToUkef = jest.fn();

jest.mock('../../../../external-api/api');

const generateHttpMocks = ({ auditDetails, newStatus, referenceNumber }: { auditDetails: unknown; newStatus: string; referenceNumber: string }) =>
  createMocks<PatchSubmitAmendmentToUkefRequest>({
    params: { facilityId, amendmentId },
    body: { auditDetails, newStatus, referenceNumber },
  });

describe('patchSubmitAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'submitPortalFacilityAmendmentToUkef').mockImplementation(mockSubmitPortalFacilityAmendmentToUkef);
    mockSubmitPortalFacilityAmendmentToUkef.mockResolvedValue(mockUpdatedAmendment);
  });

  describe('when auditDetails are invalid', () => {
    const auditDetails = { type: 'not a type' };

    it(`should return ${HttpStatusCode.BadRequest}`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({
        auditDetails,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber: testReferenceNumber,
      });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._getData()).toEqual({
        status: HttpStatusCode.BadRequest,
        message: "Supplied auditDetails must contain a 'userType' property",
        code: API_ERROR_CODE.INVALID_AUDIT_DETAILS,
      });
    });
  });

  describe('when the new status is invalid', () => {
    const invalidNewStatus = 'invalid status';
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

    it(`should return ${HttpStatusCode.BadRequest}`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus: invalidNewStatus, referenceNumber: testReferenceNumber });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._getData()).toEqual({
        status: HttpStatusCode.BadRequest,
        message: `Invalid requested status update: ${invalidNewStatus}`,
      });
    });
  });

  describe(`when the newStatus is ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED}`, () => {
    const newStatus = PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

    it('should call PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef with the correct params', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert

      expect(mockSubmitPortalFacilityAmendmentToUkef).toHaveBeenCalledTimes(1);
      expect(mockSubmitPortalFacilityAmendmentToUkef).toHaveBeenCalledWith({
        facilityId,
        amendmentId,
        newStatus,
        referenceNumber: testReferenceNumber,
        auditDetails,
      });
    });

    it(`should return ${HttpStatusCode.Ok} and the updated amendment`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockUpdatedAmendment);
    });

    it('should return the correct status and body if PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef throws an api error', async () => {
      // Arrange
      const status = HttpStatusCode.Forbidden;
      const message = 'Test error message';
      mockSubmitPortalFacilityAmendmentToUkef.mockRejectedValue(new TestApiError({ status, message }));

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(status);
      expect(res._getData()).toEqual({
        status,
        message,
      });
    });

    it(`should return ${HttpStatusCode.InternalServerError} if PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef throws an unknown error`, async () => {
      // Arrange
      const message = 'Test error message';
      mockSubmitPortalFacilityAmendmentToUkef.mockRejectedValue(new Error(message));

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({
        status: HttpStatusCode.InternalServerError,
        message: 'Unknown error occurred when updating portal amendment status',
      });
    });
  });
});
