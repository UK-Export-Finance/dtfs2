import { createMocks } from 'node-mocks-http';
import {
  PORTAL_AMENDMENT_STATUS,
  AMENDMENT_TYPES,
  API_ERROR_CODE,
  TestApiError,
  AnyObject,
  portalAmendmentToCheckerEmailVariables,
  portalAmendmentReturnToMakerEmailVariables,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { patchAmendmentStatus, PatchSubmitAmendmentToCheckerRequest } from './patch-amendment-status.controller';
import externalApi from '../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../constants/email-template-ids';

const amendmentId = 'amendmentId';
const facilityId = 'facilityId';

const mockUpdatedAmendment = { facilityId, type: AMENDMENT_TYPES.PORTAL, status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL };

const mockSubmitPortalFacilityAmendmentToChecker = jest.fn();
const mockReturnPortalFacilityAmendmentToMaker = jest.fn();
let sendEmailSpy = jest.fn();

jest.mock('../../../../external-api/api');

const mockPortalAmendmentToCheckerEmailVariables = portalAmendmentToCheckerEmailVariables();
const mockPortalAmendmentReturnToMakerEmailVariables = portalAmendmentReturnToMakerEmailVariables();

const generateHttpMocks = ({ auditDetails, newStatus, emailVariables }: { auditDetails: unknown; newStatus: string; emailVariables: AnyObject }) =>
  createMocks<PatchSubmitAmendmentToCheckerRequest>({
    params: { facilityId, amendmentId },
    body: { auditDetails, newStatus, ...emailVariables },
  });

describe('patchAmendmentStatus', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'submitPortalFacilityAmendmentToChecker').mockImplementation(mockSubmitPortalFacilityAmendmentToChecker);
    jest.spyOn(PortalFacilityAmendmentService, 'returnPortalFacilityAmendmentToMaker').mockImplementation(mockReturnPortalFacilityAmendmentToMaker);

    mockSubmitPortalFacilityAmendmentToChecker.mockResolvedValue(mockUpdatedAmendment);
    mockReturnPortalFacilityAmendmentToMaker.mockResolvedValue(mockUpdatedAmendment);

    sendEmailSpy = jest.fn(() => Promise.resolve({}));
    externalApi.sendEmail = sendEmailSpy;
  });

  describe('when auditDetails are invalid', () => {
    const auditDetails = { type: 'not a type' };

    it(`should return ${HttpStatusCode.BadRequest}`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({
        auditDetails,
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        emailVariables: mockPortalAmendmentToCheckerEmailVariables,
      });

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

    it('should NOT call externalApi.sendEmail', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({
        auditDetails,
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        emailVariables: mockPortalAmendmentToCheckerEmailVariables,
      });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('when the new status is invalid', () => {
    const invalidNewStatus = 'invalid status';
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

    it(`should return ${HttpStatusCode.BadRequest}`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus: invalidNewStatus, emailVariables: mockPortalAmendmentToCheckerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._getData()).toEqual({
        status: HttpStatusCode.BadRequest,
        message: `Invalid requested status update: ${invalidNewStatus}`,
      });
    });

    it('should NOT call externalApi.sendEmail', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus: invalidNewStatus, emailVariables: mockPortalAmendmentToCheckerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe(`when the newStatus is ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, () => {
    const newStatus = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

    it('should call PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker with the correct params', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentToCheckerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert

      expect(mockSubmitPortalFacilityAmendmentToChecker).toHaveBeenCalledTimes(1);
      expect(mockSubmitPortalFacilityAmendmentToChecker).toHaveBeenCalledWith({ facilityId, amendmentId, auditDetails });
    });

    it(`should return ${HttpStatusCode.Ok} and the updated amendment`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentToCheckerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockUpdatedAmendment);
    });

    it('should call externalApi.sendEmail twice with the correct params', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentToCheckerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      const { makersEmail, checkersEmail, emailVariables } = mockPortalAmendmentToCheckerEmailVariables;

      expect(sendEmailSpy).toHaveBeenCalledTimes(2);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_CHECKER_MAKER_EMAIL, makersEmail, emailVariables);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_CHECKER_CHECKER_EMAIL, checkersEmail, emailVariables);
    });

    it('should return the correct status and body if PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker throws an api error', async () => {
      // Arrange
      const status = HttpStatusCode.Forbidden;
      const message = 'Test error message';
      mockSubmitPortalFacilityAmendmentToChecker.mockRejectedValue(new TestApiError({ status, message }));

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentToCheckerEmailVariables });

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

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentToCheckerEmailVariables });

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

  describe(`when the newStatus is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`, () => {
    const newStatus = PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED;
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

    it('should call PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker with the correct params', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentReturnToMakerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert

      expect(mockReturnPortalFacilityAmendmentToMaker).toHaveBeenCalledTimes(1);
      expect(mockReturnPortalFacilityAmendmentToMaker).toHaveBeenCalledWith({ facilityId, amendmentId, auditDetails });
    });

    it('should NOT call PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentReturnToMakerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert

      expect(mockSubmitPortalFacilityAmendmentToChecker).not.toHaveBeenCalled();
    });

    it(`should return ${HttpStatusCode.Ok} and the updated amendment`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentReturnToMakerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockUpdatedAmendment);
    });

    it('should call externalApi.sendEmail twice with the correct params', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentReturnToMakerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      const { makersEmail, checkersEmail, emailVariables } = mockPortalAmendmentReturnToMakerEmailVariables;

      expect(sendEmailSpy).toHaveBeenCalledTimes(2);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_RETURN_TO_MAKER_MAKER_EMAIL, makersEmail, emailVariables);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_RETURN_TO_MAKER_CHECKER_EMAIL, checkersEmail, emailVariables);
    });

    it('should return the correct status and body if PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker throws an api error', async () => {
      // Arrange
      const status = HttpStatusCode.Forbidden;
      const message = 'Test error message';
      mockReturnPortalFacilityAmendmentToMaker.mockRejectedValue(new TestApiError({ status, message }));

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentReturnToMakerEmailVariables });

      // Act
      await patchAmendmentStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(status);
      expect(res._getData()).toEqual({
        status,
        message,
      });
    });

    it(`should return ${HttpStatusCode.InternalServerError} if PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker throws an unknown error`, async () => {
      // Arrange
      const message = 'Test error message';
      mockReturnPortalFacilityAmendmentToMaker.mockRejectedValue(new Error(message));

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, emailVariables: mockPortalAmendmentReturnToMakerEmailVariables });

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
