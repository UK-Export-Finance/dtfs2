import httpMocks, { MockResponse } from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { Response } from 'express';
import api from '../../../api';
import { aTfmSessionUser } from '../../../../../test-helpers';
import {
  putFeeRecordCorrectionTransientFormData,
  PutFeeRecordCorrectionTransientFormDataRequest,
} from './put-fee-record-correction-transient-form-data.controller';

console.error = jest.fn();

jest.mock('../../../api');

describe('put-fee-record-correction-transient-form-data.controller', () => {
  describe('putFeeRecordCorrectionTransientFormData', () => {
    const reportId = '1';
    const feeRecordId = '2';
    const formData = {};
    const user = aTfmSessionUser();

    const getHttpMocks = () =>
      httpMocks.createMocks<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: { reportId, feeRecordId },
        body: {
          formData,
          user,
        },
      });

    let req: PutFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = getHttpMocks());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should call the update transient form data api endpoint once', async () => {
      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(api.updateFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
    });

    it('should call the update transient form data api endpoint with the correct parameters', async () => {
      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(api.updateFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(reportId, feeRecordId, formData, user);
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error occurs`, async () => {
      // Arrange
      jest.mocked(api.updateFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.updateFeeRecordCorrectionTransientFormData).mockRejectedValue(axiosError);

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.updateFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to put fee record correction transient form data');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
