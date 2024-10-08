import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { PatchPaymentRequest, patchPayment } from './patch-payment.controller';
import { aTfmSessionUser } from '../../../../test-helpers';
import api from '../../api';

jest.mock('../../api');

console.error = jest.fn();

describe('patch-payment.controller', () => {
  describe('patchPayment', () => {
    const reportId = 12;
    const paymentId = 23;

    const getHttpMocks = () =>
      httpMocks.createMocks<PatchPaymentRequest>({
        params: { reportId: reportId.toString(), paymentId: paymentId.toString() },
        body: aPatchPaymentRequestBody(),
      });

    beforeEach(() => {
      jest.mocked(api.editPayment).mockResolvedValue();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('edits the payment and responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const paymentAmount = 314.59;
      const datePaymentReceived = new Date().toISOString();
      const paymentReference = 'Some payment reference';
      const user = aTfmSessionUser();
      req.body = {
        paymentAmount,
        datePaymentReceived,
        paymentReference,
        user,
      };

      // Act
      await patchPayment(req, res);

      // Assert
      expect(api.editPayment).toHaveBeenCalledWith(reportId.toString(), paymentId.toString(), paymentAmount, datePaymentReceived, paymentReference, user);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with an error message if an error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.editPayment).mockRejectedValue(new Error('Some error'));

      // Act
      await patchPayment(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to edit payment');
    });

    it('responds with a 500 (Internal Server Error) if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.editPayment).mockRejectedValue(new Error('Some error'));

      // Act
      await patchPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toBe(true);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.editPayment).mockRejectedValue(axiosError);

      // Act
      await patchPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
      expect(res._isEndCalled()).toBe(true);
    });

    function aPatchPaymentRequestBody(): PatchPaymentRequest['body'] {
      return {
        paymentAmount: 100,
        datePaymentReceived: '2024-01-01T00:00:00.000',
        paymentReference: 'A payment reference',
        user: aTfmSessionUser(),
      };
    }
  });
});
