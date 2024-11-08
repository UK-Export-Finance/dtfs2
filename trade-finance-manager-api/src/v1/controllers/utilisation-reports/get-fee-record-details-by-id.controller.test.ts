import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { getFeeRecordDetailsById } from './get-fee-record-details-by-id.controller';
import api from '../../api';
import { FeeRecordDetailsResponseBody } from '../../api-response-types';

console.error = jest.fn();

jest.mock('../../api');

describe('get-fee-record-details-by-id.controller', () => {
  describe('getFeeRecordDetailsById', () => {
    const reportId = '1';
    const feeRecordId = '2';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId, feeRecordId },
      });

    const aFeeRecordDetailsResponseBody = (): FeeRecordDetailsResponseBody => ({
      bank: { id: '123', name: 'Test bank' },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      },
      id: 123,
      facilityId: '0012345678',
      exporter: 'A sample exporter',
    });

    it('gets the fee record details', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody = aFeeRecordDetailsResponseBody();
      jest.mocked(api.getFeeRecordDetails).mockResolvedValue(responseBody);

      // Act
      await getFeeRecordDetailsById(req, res);

      // Assert
      expect(res._getData()).toEqual(responseBody);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecordDetails).mockResolvedValue(aFeeRecordDetailsResponseBody());

      // Act
      await getFeeRecordDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecordDetails).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getFeeRecordDetails).mockRejectedValue(axiosError);

      // Act
      await getFeeRecordDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with an error message', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getFeeRecordDetails).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordDetailsById(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee record details');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
