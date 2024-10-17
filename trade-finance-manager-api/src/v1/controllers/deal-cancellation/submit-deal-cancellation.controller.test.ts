import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TestApiError, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { submitDealCancellation, SubmitDealCancellationRequest } from './submit-deal-cancellation.controller';
import { sendDealCancellationEmail } from '../../services/deal-cancellation/send-deal-cancellation-email';

const findOneDealMock = jest.fn() as jest.Mock<Promise<TfmDeal>>;
const findFacilitiesByDealIdMock = jest.fn() as jest.Mock<Promise<TfmFacility[]>>;

jest.mock('../../api', () => ({
  findOneDeal: () => findOneDealMock(),
  findFacilitiesByDealId: () => findFacilitiesByDealIdMock(),
}));
jest.mock('../../services/deal-cancellation/send-deal-cancellation-email');

const dealCancellation = {
  reason: 'test reason',
  bankRequestDate: 1794418807,
  effectiveFrom: 1794418808,
};

const mockDealId = new ObjectId();
const mockUserId = new ObjectId();

const ukefDealId = 'ukefDealId';
const ukefFacilityIds = ['ukefFacilityId1', 'ukefFacilityId2'];

describe('controllers - deal cancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST - submitDealCancellation', () => {
    it('should return 500 when fetching the deal throws an unknown error', async () => {
      // Arrange
      findOneDealMock.mockRejectedValueOnce(new Error('An error occurred'));

      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ status: HttpStatusCode.InternalServerError, message: 'Failed to submit deal cancellation' });
    });

    it('should return correct error status & message when fetching the deal throws an api error', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const errorMessage = 'An error occurred';
      findOneDealMock.mockRejectedValueOnce(new TestApiError(errorStatus, errorMessage));

      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._getData()).toEqual({ status: errorStatus, message: `Failed to submit deal cancellation: ${errorMessage}` });
    });

    it('should return 500 when fetching the facilities throws an unknown error', async () => {
      // Arrange
      findOneDealMock.mockResolvedValueOnce({ dealSnapshot: { ukefDealId } } as TfmDeal);
      findFacilitiesByDealIdMock.mockRejectedValueOnce(new Error('An error occurred'));

      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ status: HttpStatusCode.InternalServerError, message: 'Failed to submit deal cancellation' });
    });

    it('should return correct error status & message when fetching the facilities throws an api error', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const errorMessage = 'An error occurred';
      findOneDealMock.mockResolvedValueOnce({ dealSnapshot: { ukefDealId } } as TfmDeal);
      findFacilitiesByDealIdMock.mockRejectedValueOnce(new TestApiError(errorStatus, errorMessage));

      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._getData()).toEqual({ status: errorStatus, message: `Failed to submit deal cancellation: ${errorMessage}` });
    });

    describe('when the deal and facilities are found', () => {
      beforeEach(() => {
        findOneDealMock.mockResolvedValueOnce({ dealSnapshot: { ukefDealId } } as TfmDeal);
        findFacilitiesByDealIdMock.mockResolvedValueOnce(
          ukefFacilityIds.map(
            (ukefFacilityId) =>
              ({
                facilitySnapshot: {
                  ukefFacilityId,
                },
              }) as TfmFacility,
          ),
        );
      });

      it('should call send tfm email', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
          params: { dealId: mockDealId },
          body: dealCancellation,
          user: { _id: mockUserId },
        });

        // Act
        await submitDealCancellation(req, res);

        // Assert
        expect(sendDealCancellationEmail).toHaveBeenCalledTimes(1);
        // TODO: DTFS2-7298 - use values returned by api
        expect(sendDealCancellationEmail).toHaveBeenCalledWith(ukefDealId, dealCancellation, ukefFacilityIds);
      });

      it('should return 200', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
          params: { dealId: mockDealId },
          body: dealCancellation,
          user: { _id: mockUserId },
        });

        // Act
        await submitDealCancellation(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      });
    });
  });
});
