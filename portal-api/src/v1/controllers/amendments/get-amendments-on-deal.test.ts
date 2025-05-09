import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, PortalFacilityAmendmentWithUkefId, TestApiError, aPortalSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';
import { getFacilityAmendmentsOnDeal, GetFacilityAmendmentsOnDealRequest } from './get-amendments-on-deal.controller';

jest.mock('../../api');
console.error = jest.fn();

const dealId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();

const statuses = [PORTAL_AMENDMENT_STATUS.DRAFT, PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED];
const types = [AMENDMENT_TYPES.PORTAL, AMENDMENT_TYPES.TFM];

describe('controllers - facility amendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - getAmendment', () => {
    it('should call api.getFacilityAmendmentsOnDeal with dealId and types if no statuses are queried', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { types },
      });

      // Act
      await getFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(api.getFacilityAmendmentsOnDeal).toHaveBeenCalledTimes(1);
      expect(api.getFacilityAmendmentsOnDeal).toHaveBeenCalledWith(dealId, undefined, types);
    });

    it('should call api.getFacilityAmendmentsOnDeal with the dealId, types and statuses filter', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { statuses, types },
      });

      // Act
      await getFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(api.getFacilityAmendmentsOnDeal).toHaveBeenCalledTimes(1);
      expect(api.getFacilityAmendmentsOnDeal).toHaveBeenCalledWith(dealId, statuses, types);
    });

    it(`should respond with ${HttpStatusCode.Ok} and return the amendments`, async () => {
      // Arrange
      const mockPortalAmendment: PortalFacilityAmendmentWithUkefId = {
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
          username: aPortalSessionUser().username,
          name: aPortalSessionUser().firstname,
          email: aPortalSessionUser().email,
        },
      };

      jest.mocked(api.getFacilityAmendmentsOnDeal).mockResolvedValue([mockPortalAmendment]);
      const { req, res } = httpMocks.createMocks<GetFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { statuses, types: [AMENDMENT_TYPES.PORTAL, AMENDMENT_TYPES.TFM] },
      });

      // Act
      await getFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual([mockPortalAmendment]);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = HttpStatusCode.ExpectationFailed;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.getFacilityAmendmentsOnDeal).mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { statuses, types: [AMENDMENT_TYPES.PORTAL, AMENDMENT_TYPES.TFM] },
      });

      // Act
      await getFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to get the amendments for the given deal: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.getFacilityAmendmentsOnDeal).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { statuses, types: [AMENDMENT_TYPES.PORTAL, AMENDMENT_TYPES.TFM] },
      });

      // Act
      await getFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to get the amendments for the given deal', status: HttpStatusCode.InternalServerError });
    });
  });
});
