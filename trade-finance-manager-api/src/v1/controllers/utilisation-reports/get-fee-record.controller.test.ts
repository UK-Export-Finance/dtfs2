import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { getFeeRecord } from './get-fee-record.controller';
import api from '../../api';
import { FeeRecordResponseBody } from '../../api-response-types';

console.error = jest.fn();

jest.mock('../../api');

describe('get-fee-record.controller', () => {
  describe('getFeeRecord', () => {
    const reportId = '1';
    const feeRecordId = '2';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId, feeRecordId },
      });

    const aFeeRecordResponseBody = (): FeeRecordResponseBody => ({
      bank: { id: '123', name: 'Test bank' },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      },
      id: 123,
      facilityId: '0012345678',
      exporter: 'A sample exporter',
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('gets the fee record', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody = aFeeRecordResponseBody();
      jest.mocked(api.getFeeRecord).mockResolvedValue(responseBody);

      // Act
      await getFeeRecord(req, res);

      // Assert
      expect(res._getData()).toEqual(responseBody);
      expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecord).mockResolvedValue(aFeeRecordResponseBody());

      // Act
      await getFeeRecord(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecord).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecord(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
      expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getFeeRecord).mockRejectedValue(axiosError);

      // Act
      await getFeeRecord(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
      expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId);
    });

    it('responds with an error message', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecord).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecord(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee record');
      expect(res._isEndCalled()).toEqual(true);
      expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId);
    });
  });
});
