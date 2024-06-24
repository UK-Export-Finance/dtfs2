import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { getEditPayment } from './get-edit-payment.controller';
import api from '../../api';
import { EditPaymentDetailsResponseBody } from '../../api-response-types';
import { aPayment } from '../../../../test-helpers';

console.error = jest.fn();

jest.mock('../../api');

describe('get-edit-payment.controller', () => {
  describe('getEditPayment', () => {
    const reportId = '1';
    const paymentId = '2';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId, paymentId },
      });

    const aEditPaymentDetailsResponseBody = (): EditPaymentDetailsResponseBody => ({
      bank: { id: '123', name: 'Test bank' },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 2, year: 2024 },
      },
      payment: { ...aPayment(), id: Number(paymentId) },
      feeRecords: [],
      totalReportedPayments: {
        currency: 'GBP',
        amount: 100,
      },
    });

    it('gets the edit payment details', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody = aEditPaymentDetailsResponseBody();
      jest.mocked(api.getEditPaymentDetails).mockResolvedValue(aEditPaymentDetailsResponseBody());

      // Act
      await getEditPayment(req, res);

      // Assert
      expect(res._getData()).toEqual(responseBody);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getEditPaymentDetails).mockResolvedValue(aEditPaymentDetailsResponseBody());

      // Act
      await getEditPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getEditPaymentDetails).mockRejectedValue(new Error('Some error'));

      // Act
      await getEditPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getEditPaymentDetails).mockRejectedValue(axiosError);

      // Act
      await getEditPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with an error message', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.getEditPaymentDetails).mockRejectedValue(new Error('Some error'));

      // Act
      await getEditPayment(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to get edit payment details');
      expect(res._isEndCalled()).toBe(true);
    });
  });
});
