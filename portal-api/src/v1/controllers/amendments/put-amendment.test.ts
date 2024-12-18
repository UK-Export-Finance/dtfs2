import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AMENDMENT_STATUS, AMENDMENT_TYPES, aPortalSessionUser, PortalFacilityAmendmentWithUkefId, TestApiError } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';
import { putAmendment, PutAmendmentRequest } from './put-amendment.controller';

jest.mock('../../api');

const facilityId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const dealId = new ObjectId().toString();

const amendmentUpdate = { changeCoverEndDate: true };
const user = aPortalSessionUser();

describe('controllers - facility amendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('PUT - putAmendment', () => {
    it('should call api.putPortalFacilityAmendment with the correct parameters', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<PutAmendmentRequest>({
        params: { facilityId },
        body: amendmentUpdate,
        query: { dealId },
        user,
      });

      // Act
      await putAmendment(req, res);

      // Assert
      expect(api.putPortalFacilityAmendment).toHaveBeenCalledTimes(1);
      expect(api.putPortalFacilityAmendment).toHaveBeenCalledWith({
        dealId,
        facilityId,
        amendmentUpdate,
        auditDetails: generatePortalAuditDetails(user._id),
      });
    });

    it(`should respond with ${HttpStatusCode.Ok} and return the amendment`, async () => {
      // Arrange
      const mockPortalAmendmentResponse: PortalFacilityAmendmentWithUkefId = {
        amendmentId,
        facilityId,
        type: AMENDMENT_TYPES.PORTAL,
        ukefFacilityId: '123',
        dealId,
        createdAt: 1702061978881,
        updatedAt: 1702061978881,
        status: AMENDMENT_STATUS.IN_PROGRESS,
      };

      jest.mocked(api.putPortalFacilityAmendment).mockResolvedValue(mockPortalAmendmentResponse);
      const { req, res } = httpMocks.createMocks<PutAmendmentRequest>({
        params: { facilityId },
        body: amendmentUpdate,
        query: { dealId },
        user,
      });

      // Act
      await putAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockPortalAmendmentResponse);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = HttpStatusCode.Forbidden;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.putPortalFacilityAmendment).mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<PutAmendmentRequest>({
        params: { facilityId },
        body: amendmentUpdate,
        query: { dealId },
        user,
      });

      // Act
      await putAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to update the amendment: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.putPortalFacilityAmendment).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<PutAmendmentRequest>({
        params: { facilityId },
        body: amendmentUpdate,
        query: { dealId },
        user,
      });

      // Act
      await putAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to update the amendment', status: HttpStatusCode.InternalServerError });
    });
  });
});
