import httpMocks, { MockResponse } from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { Response } from 'express';
import { getFeeRecordCorrection, GetFeeRecordCorrectionRequest } from '.';
import api from '../../../../api';
import { aGetFeeRecordCorrectionResponseBody } from '../../../../../../test-helpers/test-data/get-fee-record-correction-response-body';

jest.mock('../../../../api');

console.error = jest.fn();

describe('get-fee-record-correction.controller', () => {
  describe('getFeeRecordCorrection', () => {
    const bankId = '123';
    const correctionId = 7;

    const aValidRequestQuery = () => ({ correctionId: correctionId.toString(), bankId });

    let req: GetFeeRecordCorrectionRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      req = httpMocks.createRequest<GetFeeRecordCorrectionRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();

      jest.mocked(api.getFeeRecordCorrectionById).mockResolvedValue(aGetFeeRecordCorrectionResponseBody());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      // Arrange
      const mockedResponse = {
        ...aGetFeeRecordCorrectionResponseBody(),
        bankId,
      };

      jest.mocked(api.getFeeRecordCorrectionById).mockResolvedValue(mockedResponse);

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it(`should return the fee record correction in the response body if the api request is successful`, async () => {
      // Arrange
      const expectedResponse = {
        ...aGetFeeRecordCorrectionResponseBody(),
        bankId,
      };

      jest.mocked(api.getFeeRecordCorrectionById).mockResolvedValue(expectedResponse);

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual(expectedResponse);
    });

    it('should call the get fee record correction api endpoint once with the correct parameters', async () => {
      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(api.getFeeRecordCorrectionById).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionById).toHaveBeenCalledWith(correctionId);
    });

    it(`should return a ${HttpStatusCode.NotFound} status code if the requesting users bank id does not match the bank id returned by the api`, async () => {
      // Arrange
      const correctionBankId = 'different-bank-id';

      const mockedResponse = {
        ...aGetFeeRecordCorrectionResponseBody(),
        bankId: correctionBankId,
      };

      jest.mocked(api.getFeeRecordCorrectionById).mockResolvedValue(mockedResponse);

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error occurs`, async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionById).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getFeeRecordCorrectionById).mockRejectedValue(axiosError);

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionById).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee record correction');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
