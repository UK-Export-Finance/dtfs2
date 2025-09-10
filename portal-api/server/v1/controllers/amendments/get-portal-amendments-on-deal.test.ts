import { TestApiError, aPortalSessionUser } from "@ukef/dtfs2-common/test-helpers";
import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import api from '../../api';
import { getPortalFacilityAmendmentsOnDeal, GetPortalFacilityAmendmentsOnDealRequest } from './get-portal-amendments-on-deal.controller';

jest.mock('../../api');

const dealId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();

const statuses = [PORTAL_AMENDMENT_STATUS.DRAFT, PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED];

describe('controllers - facility amendments', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - getPortalAmendmentsOnDeal', () => {
    it('should call api.getPortalFacilityAmendmentsOnDeal with just the dealId if no statuses are queried', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetPortalFacilityAmendmentsOnDealRequest>({
        params: { dealId },
      });

      // Act
      await getPortalFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(api.getPortalFacilityAmendmentsOnDeal).toHaveBeenCalledTimes(1);
      expect(api.getPortalFacilityAmendmentsOnDeal).toHaveBeenCalledWith(dealId, undefined);
    });

    it('should call api.getPortalFacilityAmendmentsOnDeal with the dealId and statuses filter', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetPortalFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { statuses },
      });

      // Act
      await getPortalFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(api.getPortalFacilityAmendmentsOnDeal).toHaveBeenCalledTimes(1);
      expect(api.getPortalFacilityAmendmentsOnDeal).toHaveBeenCalledWith(dealId, statuses);
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
        tfm: {},
      };

      jest.mocked(api.getPortalFacilityAmendmentsOnDeal).mockResolvedValue([mockPortalAmendment]);
      const { req, res } = httpMocks.createMocks<GetPortalFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { statuses },
      });

      // Act
      await getPortalFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual([mockPortalAmendment]);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = HttpStatusCode.ExpectationFailed;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.getPortalFacilityAmendmentsOnDeal).mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetPortalFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { statuses },
      });

      // Act
      await getPortalFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to get the portal amendments for the given deal: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.getPortalFacilityAmendmentsOnDeal).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetPortalFacilityAmendmentsOnDealRequest>({
        params: { dealId },
        query: { statuses },
      });

      // Act
      await getPortalFacilityAmendmentsOnDeal(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to get the portal amendments for the given deal', status: HttpStatusCode.InternalServerError });
    });
  });
});
