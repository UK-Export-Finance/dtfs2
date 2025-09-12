import { TestApiError } from '@ukef/dtfs2-common/test-helpers';
import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import api from '../../api';
import { updateDealCancellation, UpdateDealCancellationRequest } from './update-deal-cancellation.controller';

jest.mock('../../api');

const dealCancellationUpdate = {
  reason: 'test reason',
  bankRequestDate: 1794418807,
  effectiveFrom: 1794418808,
};

const mockUpdateResult = {
  acknowledged: true,
  modifiedCount: 1,
  upsertedId: new ObjectId(),
  upsertedCount: 0,
  matchedCount: 1,
};

const mockDealId = new ObjectId();
const mockUserId = new ObjectId();

describe('controllers - deal cancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('PUT - updateDealCancellation', () => {
    it('should call api.updateDealCancellation with the correct parameters', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<UpdateDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellationUpdate,
        user: { _id: mockUserId },
      });
      const auditDetails = { id: mockUserId, userType: 'tfm' };

      // Act
      await updateDealCancellation(req, res);

      // Assert
      expect(api.updateDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.updateDealCancellation).toHaveBeenCalledWith({ dealId: mockDealId, dealCancellationUpdate, auditDetails });
    });

    it('should return the deal update object on success', async () => {
      jest.mocked(api.updateDealCancellation).mockResolvedValue(mockUpdateResult);

      // Arrange
      const { req, res } = httpMocks.createMocks<UpdateDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellationUpdate,
        user: { _id: mockUserId },
      });

      // Act
      await updateDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockUpdateResult);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = 404;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.updateDealCancellation).mockRejectedValue(
        new TestApiError({
          status: testErrorStatus,
          message: testApiErrorMessage,
        }),
      );

      // Arrange
      const { req, res } = httpMocks.createMocks<UpdateDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellationUpdate,
        user: { _id: mockUserId },
      });

      // Act
      await updateDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to update deal cancellation: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.updateDealCancellation).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<UpdateDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellationUpdate,
        user: { _id: mockUserId },
      });

      // Act
      await updateDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to update deal cancellation', status: 500 });
    });
  });
});
