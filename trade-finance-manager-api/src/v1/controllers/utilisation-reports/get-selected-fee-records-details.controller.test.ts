import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { getSelectedFeeRecordsDetails, GetSelectedFeeRecordsDetailsRequest } from './get-selected-fee-records-details.controller';
import api from '../../api';
import { SelectedFeeRecordsDetailsResponseBody } from '../../api-response-types';
import { aPayment } from '../../../../test-helpers';

console.error = jest.fn();

jest.mock('../../api');

describe('get-selected-fee-records-details.controller', () => {
  describe('getSelectedFeeRecordsDetails', () => {
    const mockReportId = '123';
    const mockFeeRecordIds = [1, 2];

    const getHttpMocks = () =>
      httpMocks.createMocks<GetSelectedFeeRecordsDetailsRequest>({
        params: { id: mockReportId },
        query: { includeAvailablePaymentGroups: 'true' },
        body: { feeRecordIds: mockFeeRecordIds },
      });

    const aSelectedFeeRecordsDetailsResponseBody = (): SelectedFeeRecordsDetailsResponseBody => ({
      totalReportedPayments: {
        currency: 'GBP',
        amount: 100,
      },
      bank: { name: 'Test bank' },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 2, year: 2024 },
      },
      feeRecords: [],
      payments: [aPayment()],
      canAddToExistingPayment: false,
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('gets the selected fee records details', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody = aSelectedFeeRecordsDetailsResponseBody();
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(responseBody);

      // Act
      await getSelectedFeeRecordsDetails(req, res);

      // Assert
      expect(res._getData()).toEqual(responseBody);
    });

    it("includes the attached fee records when the includeAvailablePaymentGroups query is set to 'true'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.query = { includeAvailablePaymentGroups: 'true' };

      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetailsResponseBody());

      // Act
      await getSelectedFeeRecordsDetails(req, res);

      // Assert
      expect(api.getSelectedFeeRecordsDetails).toHaveBeenCalledWith(mockReportId, mockFeeRecordIds, true);
    });

    it("does not include the attached fee records when the includeAvailablePaymentGroups query is set to 'false'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.query = { includeAvailablePaymentGroups: 'false' };

      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetailsResponseBody());

      // Act
      await getSelectedFeeRecordsDetails(req, res);

      // Assert
      expect(api.getSelectedFeeRecordsDetails).toHaveBeenCalledWith(mockReportId, mockFeeRecordIds, false);
    });

    it('does not include the attached fee records when the includeAvailablePaymentGroups query is undefined', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.query = {};

      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetailsResponseBody());

      // Act
      await getSelectedFeeRecordsDetails(req, res);

      // Assert
      expect(api.getSelectedFeeRecordsDetails).toHaveBeenCalledWith(mockReportId, mockFeeRecordIds, false);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetailsResponseBody());

      // Act
      await getSelectedFeeRecordsDetails(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getSelectedFeeRecordsDetails).mockRejectedValue(new Error('Some error'));

      // Act
      await getSelectedFeeRecordsDetails(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getSelectedFeeRecordsDetails).mockRejectedValue(axiosError);

      // Act
      await getSelectedFeeRecordsDetails(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with an error message when api call fails', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getSelectedFeeRecordsDetails).mockRejectedValue(new Error('Some error'));

      // Act
      await getSelectedFeeRecordsDetails(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get selected fee records details');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
