import httpMocks, { MockResponse } from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { Response } from 'express';
import { aFeeRecordCorrectionReviewInformation } from '@ukef/dtfs2-common';
import { getFeeRecordCorrectionReview, GetFeeRecordCorrectionReviewRequest } from './fee-record-correction-review.controller';
import api from '../../../api';

jest.mock('../../../api');

console.error = jest.fn();

describe('get-fee-record-correction-review.controller', () => {
  describe('getFeeRecordCorrectionReview', () => {
    const userId = 'abc123';
    const correctionId = 7;

    const aValidRequestQuery = () => ({ correctionId: correctionId.toString(), userId });

    let req: GetFeeRecordCorrectionReviewRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      req = httpMocks.createRequest<GetFeeRecordCorrectionReviewRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();

      jest.mocked(api.getFeeRecordCorrectionReview).mockResolvedValue(aFeeRecordCorrectionReviewInformation());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      // Arrange
      const mockedResponse = {
        ...aFeeRecordCorrectionReviewInformation(),
        userId,
      };

      jest.mocked(api.getFeeRecordCorrectionReview).mockResolvedValue(mockedResponse);

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it(`should return the fee record correction review information in the response body if the api request is successful`, async () => {
      // Arrange
      const expectedResponse = {
        ...aFeeRecordCorrectionReviewInformation(),
        userId,
      };

      jest.mocked(api.getFeeRecordCorrectionReview).mockResolvedValue(expectedResponse);

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getData()).toEqual(expectedResponse);
    });

    it('should call the get fee record correction review information api endpoint once with the correct parameters', async () => {
      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(api.getFeeRecordCorrectionReview).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionReview).toHaveBeenCalledWith(correctionId, userId);
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error occurs`, async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionReview).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getFeeRecordCorrectionReview).mockRejectedValue(axiosError);

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionReview).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee record correction review');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
