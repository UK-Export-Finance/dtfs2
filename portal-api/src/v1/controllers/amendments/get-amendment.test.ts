import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AMENDMENT_STATUS, AMENDMENT_TYPES, PortalFacilityAmendmentWithUkefId, TestApiError } from '@ukef/dtfs2-common';
import api from '../../api';
import { getAmendment, GetAmendmentRequest } from './get-amendment.controller';

jest.mock('../../api');

const facilityId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const dealId = new ObjectId().toString();

describe('controllers - facility amendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - getAmendment', () => {
    it('should call api.getPortalFacilityAmendment with the facility Id and amendment Id', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({
        params: { facilityId, amendmentId },
      });

      // Act
      await getAmendment(req, res);

      // Assert
      expect(api.getPortalFacilityAmendment).toHaveBeenCalledTimes(1);
      expect(api.getPortalFacilityAmendment).toHaveBeenCalledWith(facilityId, amendmentId);
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

      jest.mocked(api.getPortalFacilityAmendment).mockResolvedValue(mockPortalAmendmentResponse);
      const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({
        params: { facilityId, amendmentId },
      });

      // Act
      await getAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockPortalAmendmentResponse);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = HttpStatusCode.ExpectationFailed;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.getPortalFacilityAmendment).mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({
        params: { facilityId, amendmentId },
      });

      // Act
      await getAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to get the amendment: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.getPortalFacilityAmendment).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({
        params: { facilityId, amendmentId },
      });

      // Act
      await getAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to get the amendment', status: HttpStatusCode.InternalServerError });
    });
  });
});
