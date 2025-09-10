import { feeRecordCorrectionRequestReviewResponseBodyMock } from '@ukef/dtfs2-common/test-helpers';
import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { getFeeRecordCorrectionRequestReview, GetFeeRecordCorrectionRequestReviewRequest } from './get-fee-record-correction-request-review.controller';
import api from '../../../api';
import { FeeRecordCorrectionRequestReviewResponseBody } from '../../../api-response-types';

console.error = jest.fn();

jest.mock('../../../api');

describe('get-fee-record-correction-request-review.controller', () => {
  describe('getFeeRecordCorrectionRequestReview', () => {
    const reportId = '1';
    const feeRecordId = '2';
    const user = 'abc123';

    const getHttpMocks = () =>
      httpMocks.createMocks<GetFeeRecordCorrectionRequestReviewRequest>({
        params: { reportId, feeRecordId, user },
      });

    const aResponseBody = (): FeeRecordCorrectionRequestReviewResponseBody => ({
      ...feeRecordCorrectionRequestReviewResponseBodyMock,
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should respond with the fee record correction request review', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody = aResponseBody();
      jest.mocked(api.getFeeRecordCorrectionRequestReview).mockResolvedValue(responseBody);

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getData()).toEqual(responseBody);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledWith(reportId, feeRecordId, user);
    });

    it(`should respond with a ${HttpStatusCode.Ok}`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecordCorrectionRequestReview).mockResolvedValue(aResponseBody());

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledWith(reportId, feeRecordId, user);
    });

    it(`should respond with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecordCorrectionRequestReview).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledWith(reportId, feeRecordId, user);
    });

    it('should respond with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getFeeRecordCorrectionRequestReview).mockRejectedValue(axiosError);

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledWith(reportId, feeRecordId, user);
    });

    it('should respond with an error message', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecordCorrectionRequestReview).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee record correction request review');
      expect(res._isEndCalled()).toEqual(true);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionRequestReview).toHaveBeenCalledWith(reportId, feeRecordId, user);
    });
  });
});
