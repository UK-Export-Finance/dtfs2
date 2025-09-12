import httpMocks from 'node-mocks-http';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import api from '../../api';
import { getFeeRecordsToKey } from './get-fee-records-to-key.controller';
import { FeeRecordsToKeyResponseBody } from '../../api-response-types';

console.error = jest.fn();

jest.mock('../../api');

describe('get-fee-records-to-key.controller', () => {
  describe('getFeeRecordsToKey', () => {
    const reportId = '1';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId },
      });

    const aFeeRecordsToKeyResponseBody = (): FeeRecordsToKeyResponseBody => ({
      reportId: 1,
      bank: { id: '123', name: 'Test bank' },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 2, year: 2024 },
      },
      feeRecords: [],
    });

    it('gets the fee records to key', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody = aFeeRecordsToKeyResponseBody();
      jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockResolvedValue(responseBody);

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      expect(res._getData()).toEqual(responseBody);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockResolvedValue(aFeeRecordsToKeyResponseBody());

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockRejectedValue(axiosError);

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with an error message', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee records to key');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
