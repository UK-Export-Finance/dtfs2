import { TestApiError } from "@ukef/dtfs2-common/test-helpers";
import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import api from '../../api';
import {
  getLatestAmendmentFacilityValueAndCoverEndDate,
  GetLatestAmendmentFacilityValueAndCoverEndDateRequest,
} from './get-latest-amendment-facility-value-and-cover-end-date.controller';

jest.mock('../../api');

const facilityId = new ObjectId();

const latestValues = {
  value: '1000000',
  coverEndDate: '167368000000',
};

describe('controllers - facility amendments', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - getLatestAmendmentFacilityValueAndCoverEndDate', () => {
    it('should call api.getLatestAmendmentFacilityValueAndCoverEndDate with just the facilityId', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetLatestAmendmentFacilityValueAndCoverEndDateRequest>({
        params: { facilityId },
      });

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(api.getLatestAmendmentFacilityValueAndCoverEndDate).toHaveBeenCalledTimes(1);
      expect(api.getLatestAmendmentFacilityValueAndCoverEndDate).toHaveBeenCalledWith(facilityId);
    });

    it(`should respond with ${HttpStatusCode.Ok} and return the latest value and cover end date`, async () => {
      // Arrange
      jest.mocked(api.getLatestAmendmentFacilityValueAndCoverEndDate).mockResolvedValue(latestValues);

      const { req, res } = httpMocks.createMocks<GetLatestAmendmentFacilityValueAndCoverEndDateRequest>({
        params: { facilityId },
      });

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(latestValues);
    });

    it(`should respond with ${HttpStatusCode.NotFound} when no response is received from api.getLatestAmendmentFacilityValueAndCoverEndDate`, async () => {
      // Arrange
      // @ts-ignore - mocking no values being returned
      jest.mocked(api.getLatestAmendmentFacilityValueAndCoverEndDate).mockResolvedValue(null);

      const { req, res } = httpMocks.createMocks<GetLatestAmendmentFacilityValueAndCoverEndDateRequest>({
        params: { facilityId },
      });

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      expect(res._getData()).toEqual({
        message: 'Latest amendment value and cover end date not found',
        status: HttpStatusCode.NotFound,
      });
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = HttpStatusCode.ExpectationFailed;
      const testApiErrorMessage = 'test api error message';
      jest
        .mocked(api.getLatestAmendmentFacilityValueAndCoverEndDate)
        .mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetLatestAmendmentFacilityValueAndCoverEndDateRequest>({
        params: { facilityId },
      });

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({
        message: `Failed to get the latest facility amendment value and cover end date: ${testApiErrorMessage}`,
        status: testErrorStatus,
      });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.getLatestAmendmentFacilityValueAndCoverEndDate).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetLatestAmendmentFacilityValueAndCoverEndDateRequest>({
        params: { facilityId },
      });

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({
        message: 'Failed to get the latest facility amendment value and cover end date',
        status: HttpStatusCode.InternalServerError,
      });
    });
  });
});
