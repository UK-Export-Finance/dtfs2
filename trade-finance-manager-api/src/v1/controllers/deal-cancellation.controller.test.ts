import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TestApiError } from '@ukef/dtfs2-common';
import api from '../api';
import { updateDealCancellation, UpdateDealCancellationRequest } from './deal-cancellation.controller';

jest.mock('../api');

const dealCancellationUpdate = {
  reason: 'test reason',
  bankRequestDate: 1794418807,
  effectiveFrom: 1794418808,
};

const mockDealId = new ObjectId();
const mockUserId = new ObjectId();

describe('controllers - deal cancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('PUT - updateDealCancellation', () => {
    it('should call api.updateDealCancellation with the correct parameters', async () => {
      jest.mocked(api.updateDealCancellation);

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

    it('should return the deal cancellation on success', async () => {
      jest.mocked(api.updateDealCancellation).mockResolvedValue(dealCancellationUpdate);

      // Arrange
      const { req, res } = httpMocks.createMocks<UpdateDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellationUpdate,
        user: { _id: mockUserId },
      });

      // Act
      await updateDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(expect.objectContaining(dealCancellationUpdate));
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = 404;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.updateDealCancellation).mockRejectedValue(new TestApiError(testErrorStatus, testApiErrorMessage));

      // Arrange
      const { req, res } = httpMocks.createMocks<UpdateDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellationUpdate,
        user: { _id: mockUserId },
      });

      // Act
      await updateDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(testErrorStatus);
      expect(res._getData()).toEqual(expect.objectContaining({ message: `Failed to update deal cancellation: ${testApiErrorMessage}` }));
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
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual(expect.objectContaining({ message: 'Failed to update deal cancellation' }));
    });
  });
});
