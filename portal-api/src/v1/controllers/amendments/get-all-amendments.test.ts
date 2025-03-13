import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, PortalFacilityAmendmentWithUkefId, TestApiError, aPortalSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';
import { getAllFacilityAmendments, GetAllFacilityAmendmentsRequest } from './get-all-amendments.controller';

jest.mock('../../api');

const dealId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();

const statuses = [PORTAL_AMENDMENT_STATUS.DRAFT, PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED];

describe('controllers - facility amendments', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - getAmendments', () => {
    it('should call api.getAllPortalFacilityAmendments if no statuses are queried', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetAllFacilityAmendmentsRequest>();

      // Act
      await getAllFacilityAmendments(req, res);

      // Assert
      expect(api.getAllPortalFacilityAmendments).toHaveBeenCalledTimes(1);
      expect(api.getAllPortalFacilityAmendments).toHaveBeenCalledWith(undefined);
    });

    it('should call api.getAllPortalFacilityAmendments with statuses filter', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetAllFacilityAmendmentsRequest>({
        query: { statuses },
      });

      // Act
      await getAllFacilityAmendments(req, res);

      // Assert
      expect(api.getAllPortalFacilityAmendments).toHaveBeenCalledTimes(1);
      expect(api.getAllPortalFacilityAmendments).toHaveBeenCalledWith(statuses);
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

      jest.mocked(api.getAllPortalFacilityAmendments).mockResolvedValue([mockPortalAmendment]);
      const { req, res } = httpMocks.createMocks<GetAllFacilityAmendmentsRequest>({
        query: { statuses },
      });

      // Act
      await getAllFacilityAmendments(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual([mockPortalAmendment]);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = HttpStatusCode.ExpectationFailed;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.getAllPortalFacilityAmendments).mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetAllFacilityAmendmentsRequest>({
        query: { statuses },
      });

      // Act
      await getAllFacilityAmendments(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to get all portal amendments: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.getAllPortalFacilityAmendments).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetAllFacilityAmendmentsRequest>({
        query: { statuses },
      });

      // Act
      await getAllFacilityAmendments(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to get all portal amendments', status: HttpStatusCode.InternalServerError });
    });
  });
});
