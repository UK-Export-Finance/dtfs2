import httpMocks, { MockResponse } from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { Response } from 'express';
import api from '../../../api';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { postFeeRecordCorrection, PostFeeRecordCorrectionRequest } from './post-fee-record-correction.controller';

console.error = jest.fn();

jest.mock('../../../api');

describe('post-fee-record-correction.controller', () => {
  describe('postFeeRecordCorrection', () => {
    const reportId = '1';
    const feeRecordId = '2';
    const user = aTfmSessionUser();

    const getHttpMocks = () =>
      httpMocks.createMocks<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user },
      });

    let req: PostFeeRecordCorrectionRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = getHttpMocks());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should call the create fee record correction api endpoint once', async () => {
      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(api.createFeeRecordCorrection).toHaveBeenCalledTimes(1);
    });

    it('should call the create fee record correction api endpoint with the correct parameters', async () => {
      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(api.createFeeRecordCorrection).toHaveBeenCalledWith(reportId, feeRecordId, user);
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error occurs`, async () => {
      // Arrange
      jest.mocked(api.createFeeRecordCorrection).mockRejectedValue(new Error('Some error'));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.createFeeRecordCorrection).mockRejectedValue(axiosError);

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.createFeeRecordCorrection).mockRejectedValue(new Error('Some error'));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to create fee record correction');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
