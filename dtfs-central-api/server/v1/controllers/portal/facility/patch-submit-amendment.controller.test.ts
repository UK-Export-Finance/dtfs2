import { TestApiError, portalAmendmentToUkefEmailVariables } from '@ukef/dtfs2-common/test-helpers';
import { createMocks } from 'node-mocks-http';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, API_ERROR_CODE, AnyObject } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { PortalDealService } from '../../../../services/portal/deal.service';
import { patchSubmitAmendment, PatchSubmitAmendmentToUkefRequest } from './patch-submit-amendment.controller';
import externalApi from '../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../constants/email-template-ids';

const amendmentId = new ObjectId();
const dealId = new ObjectId();
const facilityId = new ObjectId();
const testReferenceNumber = '0040012345-001';

const mockUpdatedAmendment = { dealId, facilityId, type: AMENDMENT_TYPES.PORTAL, status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED };

const mockSubmitPortalFacilityAmendmentToUkef = jest.fn();
const mockUpdateDeal = jest.fn();
let sendEmailSpy = jest.fn();

jest.mock('../../../../external-api/api');

const mockEmailVariables = portalAmendmentToUkefEmailVariables();

const generateHttpMocks = ({
  auditDetails,
  newStatus,
  referenceNumber,
  emailVariables,
}: {
  auditDetails: unknown;
  newStatus: string;
  referenceNumber: string;
  emailVariables: AnyObject;
}) =>
  createMocks<PatchSubmitAmendmentToUkefRequest>({
    params: { facilityId, amendmentId },
    body: { auditDetails, newStatus, referenceNumber, ...emailVariables },
  });

describe('patchSubmitAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'submitPortalFacilityAmendmentToUkef').mockImplementation(mockSubmitPortalFacilityAmendmentToUkef);
    jest.spyOn(PortalDealService, 'updateDeal').mockImplementation(mockUpdateDeal);
    mockSubmitPortalFacilityAmendmentToUkef.mockResolvedValue(mockUpdatedAmendment);

    sendEmailSpy = jest.fn(() => Promise.resolve({}));
    externalApi.sendEmail = sendEmailSpy;
  });

  describe('when auditDetails are invalid', () => {
    const auditDetails = { type: 'not a type' };

    it(`should return ${HttpStatusCode.BadRequest}`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({
        auditDetails,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber: testReferenceNumber,
        emailVariables: mockEmailVariables,
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

    it('should NOT call externalApi.sendEmail', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({
        auditDetails,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber: testReferenceNumber,
        emailVariables: mockEmailVariables,
      });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('when the new status is invalid', () => {
    const invalidNewStatus = 'invalid status';
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

    it(`should return ${HttpStatusCode.BadRequest}`, async () => {
      // Arrange
      const { req, res } = generateHttpMocks({
        auditDetails,
        newStatus: invalidNewStatus,
        referenceNumber: testReferenceNumber,
        emailVariables: mockEmailVariables,
      });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._getData()).toEqual({
        status: HttpStatusCode.BadRequest,
        message: `Invalid requested status update: ${invalidNewStatus}`,
      });
    });

    it('should NOT call externalApi.sendEmail', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({
        auditDetails,
        newStatus: invalidNewStatus,
        referenceNumber: testReferenceNumber,
        emailVariables: mockEmailVariables,
      });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe(`when the newStatus is ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED}`, () => {
    const newStatus = PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;
    const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

    it('should call PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef with the correct params', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber, emailVariables: mockEmailVariables });

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
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber, emailVariables: mockEmailVariables });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockUpdatedAmendment);
    });

    it('should call externalApi.sendEmail with the correct params', async () => {
      // Arrange
      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber, emailVariables: mockEmailVariables });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      const { makersEmail, checkersEmail, pimEmail, emailVariables } = mockEmailVariables;

      const emails = [makersEmail, checkersEmail, pimEmail];

      expect(sendEmailSpy).toHaveBeenCalledTimes(3);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_UKEF_MAKER_EMAIL, emails[0], emailVariables);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_UKEF_CHECKER_EMAIL, emails[1], emailVariables);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_UKEF_PIM_EMAIL, emails[2], emailVariables);
    });

    it('should return the correct status and body if PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef throws an api error', async () => {
      // Arrange
      const status = HttpStatusCode.Forbidden;
      const message = 'Test error message';
      mockSubmitPortalFacilityAmendmentToUkef.mockRejectedValue(new TestApiError({ status, message }));

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber, emailVariables: mockEmailVariables });

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

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber, emailVariables: mockEmailVariables });

      // Act
      await patchSubmitAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({
        status: HttpStatusCode.InternalServerError,
        message: 'Unknown error occurred when updating portal amendment status',
      });
    });

    it(`should return ${HttpStatusCode.InternalServerError} if PortalDealService.updateDeal throws an unknown error`, async () => {
      // Arrange
      const message = 'Test error message';
      mockUpdateDeal.mockRejectedValue(new Error(message));

      const { req, res } = generateHttpMocks({ auditDetails, newStatus, referenceNumber: testReferenceNumber, emailVariables: mockEmailVariables });

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
