import httpMocks, { MockResponse } from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { Response } from 'express';
import api from '../../../api';
import { aTfmSessionUser } from '../../../../../test-helpers';
import {
  deleteFeeRecordCorrectionTransientFormData,
  DeleteFeeRecordCorrectionTransientFormDataRequest,
} from './delete-fee-record-correction-transient-form-data.controller';

console.error = jest.fn();

jest.mock('../../../api');

describe('delete-fee-record-correction-transient-form-data.controller', () => {
  describe('deleteFeeRecordCorrectionTransientFormData', () => {
    const reportId = '1';
    const feeRecordId = '2';
    const userId = aTfmSessionUser()._id;

    const getHttpMocks = () =>
      httpMocks.createMocks<DeleteFeeRecordCorrectionTransientFormDataRequest>({
        params: { reportId, feeRecordId, user: userId },
      });

    let req: DeleteFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = getHttpMocks());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should return a ${HttpStatusCode.NoContent} status code if the api request is successful`, async () => {
      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NoContent);
    });

    it('should call the delete transient form data api endpoint once', async () => {
      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
    });

    it('should call the delete transient form data api endpoint with the correct parameters', async () => {
      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(reportId, feeRecordId, userId);
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error occurs`, async () => {
      // Arrange
      jest.mocked(api.deleteFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.deleteFeeRecordCorrectionTransientFormData).mockRejectedValue(axiosError);

      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.deleteFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to delete fee record correction transient form data');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
