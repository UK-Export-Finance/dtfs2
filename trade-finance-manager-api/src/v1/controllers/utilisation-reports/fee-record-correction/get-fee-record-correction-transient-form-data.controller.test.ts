import httpMocks, { MockResponse } from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { RecordCorrectionTransientFormData, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { Response } from 'express';
import api from '../../../api';
import { aTfmSessionUser } from '../../../../../test-helpers';
import {
  getFeeRecordCorrectionTransientFormData,
  GetFeeRecordCorrectionTransientFormDataRequest,
} from './get-fee-record-correction-transient-form-data.controller';

console.error = jest.fn();

jest.mock('../../../api');

describe('get-fee-record-correction-transient-form-data.controller', () => {
  describe('getFeeRecordCorrectionTransientFormData', () => {
    const reportId = '1';
    const feeRecordId = '2';
    const userId = aTfmSessionUser()._id;

    const getHttpMocks = () =>
      httpMocks.createMocks<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: { reportId, feeRecordId, user: userId },
      });

    let req: GetFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = getHttpMocks());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it(`should return the form data in the request body if the api request is successful`, async () => {
      // Arrange
      const formData: RecordCorrectionTransientFormData = {
        reasons: [RECORD_CORRECTION_REASON.OTHER],
        additionalInfo: 'Some additional information',
      };

      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue(formData);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(formData);
    });

    it('should call the get transient form data api endpoint once', async () => {
      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(api.getFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
    });

    it('should call the get transient form data api endpoint with the correct parameters', async () => {
      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(api.getFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(reportId, feeRecordId, userId);
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error occurs`, async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockRejectedValue(axiosError);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee record correction transient form data');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
