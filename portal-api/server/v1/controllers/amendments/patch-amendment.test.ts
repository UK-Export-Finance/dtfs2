import { aPortalSessionUser, TestApiError } from '@ukef/dtfs2-common/test-helpers';
import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';
import { patchAmendment, PatchAmendmentRequest } from './patch-amendment.controller';

jest.mock('../../api');

console.error = jest.fn();

const facilityId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const dealId = new ObjectId().toString();

const update = { changeCoverEndDate: true };
const user = aPortalSessionUser();

describe('controllers - facility amendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('PATCH - patchAmendment', () => {
    it('should call api.patchPortalFacilityAmendment with the correct parameters', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<PatchAmendmentRequest>({
        params: { facilityId, amendmentId },
        body: { update },
        user,
      });

      // Act
      await patchAmendment(req, res);

      // Assert
      expect(api.patchPortalFacilityAmendment).toHaveBeenCalledTimes(1);
      expect(api.patchPortalFacilityAmendment).toHaveBeenCalledWith({
        facilityId,
        amendmentId,
        update,
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
        status: PORTAL_AMENDMENT_STATUS.DRAFT,
        eligibilityCriteria: { version: 1, criteria: [] },
        createdBy: {
          username: user.username,
          name: user.firstname,
          email: user.email,
        },
        tfm: {},
      };

      jest.mocked(api.patchPortalFacilityAmendment).mockResolvedValue(mockPortalAmendmentResponse);
      const { req, res } = httpMocks.createMocks<PatchAmendmentRequest>({
        params: { facilityId, amendmentId },
        body: { update },
        user,
      });

      // Act
      await patchAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockPortalAmendmentResponse);
      expect(console.error).toHaveBeenCalledTimes(0);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = HttpStatusCode.Forbidden;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.patchPortalFacilityAmendment).mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<PatchAmendmentRequest>({
        params: { facilityId, amendmentId },
        body: { update },
        user,
      });

      // Act
      await patchAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to update the amendment: ${testApiErrorMessage}`, status: testErrorStatus });
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.patchPortalFacilityAmendment).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<PatchAmendmentRequest>({
        params: { facilityId, amendmentId },
        body: { update },
        user,
      });

      // Act
      await patchAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to update the amendment', status: HttpStatusCode.InternalServerError });
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });
});
