import httpMocks, { MockResponse } from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import api from '../../../api';
import { CompletedFeeRecordCorrectionsRequest, getCompletedFeeRecordCorrections } from './completed-fee-record-corrections.controller';
import { aGetCompletedFeeRecordCorrectionsResponseBody } from '../../../../../test-helpers/test-data/get-completed-fee-record-corrections-response-body';

jest.mock('../../../api');

console.error = jest.fn();

describe('completed-fee-record-corrections.controller', () => {
  const bankId = 123;
  const portalUserId = new ObjectId().toString();

  const aValidRequestParams = () => ({ bankId: bankId.toString() });

  let req: CompletedFeeRecordCorrectionsRequest;
  let res: MockResponse<Response>;

  beforeEach(() => {
    req = httpMocks.createRequest<CompletedFeeRecordCorrectionsRequest>({
      params: aValidRequestParams(),
      user: { _id: portalUserId },
    });
    res = httpMocks.createResponse();
  });

  describe('getCompletedFeeRecordCorrections', () => {
    beforeEach(() => {
      jest.mocked(api.getCompletedFeeRecordCorrections).mockResolvedValue(aGetCompletedFeeRecordCorrectionsResponseBody());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      // Arrange
      const mockedResponse = aGetCompletedFeeRecordCorrectionsResponseBody();

      jest.mocked(api.getCompletedFeeRecordCorrections).mockResolvedValue(mockedResponse);

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it(`should return the completed fee record corrections in the response body if the api request is successful`, async () => {
      // Arrange
      const expectedResponse = aGetCompletedFeeRecordCorrectionsResponseBody();

      jest.mocked(api.getCompletedFeeRecordCorrections).mockResolvedValue(expectedResponse);

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getData()).toEqual(expectedResponse);
    });

    it('should call the "get completed fee record corrections" api endpoint once with the correct parameters', async () => {
      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(api.getCompletedFeeRecordCorrections).toHaveBeenCalledTimes(1);
      expect(api.getCompletedFeeRecordCorrections).toHaveBeenCalledWith(bankId);
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error occurs`, async () => {
      // Arrange
      jest.mocked(api.getCompletedFeeRecordCorrections).mockRejectedValue(new Error('Some error'));

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getCompletedFeeRecordCorrections).mockRejectedValue(axiosError);

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.getCompletedFeeRecordCorrections).mockRejectedValue(new Error('Some error'));

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get completed fee record corrections');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
