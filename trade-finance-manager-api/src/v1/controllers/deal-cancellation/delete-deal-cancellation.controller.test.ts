import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TestApiError } from '@ukef/dtfs2-common';
import api from '../../api';
import { deleteDealCancellation, DeleteDealCancellationRequest } from './delete-deal-cancellation.controller';

jest.mock('../../api');

const mockDealId = new ObjectId();
const mockUserId = new ObjectId();

describe('controllers - deal cancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('DELETE - deleteDealCancellation', () => {
    it('should call api.deleteDealCancellation with the correct parameters', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteDealCancellationRequest>({
        params: { dealId: mockDealId },
        user: { _id: mockUserId },
      });
      const auditDetails = { id: mockUserId, userType: 'tfm' };

      // Act
      await deleteDealCancellation(req, res);

      // Assert
      expect(api.deleteDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.deleteDealCancellation).toHaveBeenCalledWith({ dealId: mockDealId, auditDetails });
    });

    it('should return 204 (No content) on success', async () => {
      jest.mocked(api.deleteDealCancellation).mockResolvedValue();

      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteDealCancellationRequest>({
        params: { dealId: mockDealId },
        user: { _id: mockUserId },
      });

      // Act
      await deleteDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.NoContent);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = 418;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.deleteDealCancellation).mockRejectedValue(new TestApiError(testErrorStatus, testApiErrorMessage));

      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteDealCancellationRequest>({
        params: { dealId: mockDealId },
        user: { _id: mockUserId },
      });

      // Act
      await deleteDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to delete deal cancellation: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.deleteDealCancellation).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteDealCancellationRequest>({
        params: { dealId: mockDealId },
        user: { _id: mockUserId },
      });

      // Act
      await deleteDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to delete deal cancellation', status: 500 });
    });
  });
});
