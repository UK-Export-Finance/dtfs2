import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { aPortalSessionUser, TestApiError } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';
import { deleteAmendment, DeleteAmendmentRequest } from './delete-amendment.controller';

jest.mock('../../api');

console.error = jest.fn();

const facilityId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();

const user = aPortalSessionUser();

describe('controllers - facility amendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('DELETE - deleteAmendment', () => {
    it('should call api.deletePortalFacilityAmendment with the correct parameters', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteAmendmentRequest>({
        params: { facilityId, amendmentId },
        user,
      });

      // Act
      await deleteAmendment(req, res);

      // Assert
      expect(api.deletePortalFacilityAmendment).toHaveBeenCalledTimes(1);
      expect(api.deletePortalFacilityAmendment).toHaveBeenCalledWith(facilityId, amendmentId, generatePortalAuditDetails(user._id));
    });

    it('should call the deletePortalFacilityAmendment api endpoint once', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteAmendmentRequest>({
        params: { facilityId, amendmentId },
        user,
      });

      // Act
      await deleteAmendment(req, res);

      // Assert
      expect(api.deletePortalFacilityAmendment).toHaveBeenCalledTimes(1);
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteAmendmentRequest>({
        params: { facilityId, amendmentId },
        user,
      });

      // Act
      await deleteAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = HttpStatusCode.Forbidden;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.deletePortalFacilityAmendment).mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteAmendmentRequest>({
        params: { facilityId, amendmentId },
        user,
      });

      // Act
      await deleteAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to delete the amendment: ${testApiErrorMessage}`, status: testErrorStatus });
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.deletePortalFacilityAmendment).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<DeleteAmendmentRequest>({
        params: { facilityId, amendmentId },
        user,
      });

      // Act
      await deleteAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to delete the amendment', status: HttpStatusCode.InternalServerError });
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });
});
