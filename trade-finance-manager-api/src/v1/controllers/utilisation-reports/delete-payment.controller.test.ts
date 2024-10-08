import httpMocks from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { deletePayment } from './delete-payment.controller';
import api from '../../api';
import { aTfmSessionUser } from '../../../../test-helpers';

console.error = jest.fn();

jest.mock('../../api');

describe('delete-payment.controller', () => {
  describe('deletePayment', () => {
    beforeEach(() => {
      jest.mocked(api.deletePaymentById).mockResolvedValue();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    const reportId = '12';
    const paymentId = '6';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId, paymentId },
        body: {
          user: aTfmSessionUser(),
        },
      });

    it('deletes the payment and responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const user = aTfmSessionUser();
      req.body = { user };

      // Act
      await deletePayment(req, res);

      // Assert
      expect(api.deletePaymentById).toHaveBeenCalledWith(reportId, paymentId, user);
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with a 500 if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.deletePaymentById).mockRejectedValue(new Error('Some error'));

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with a specific error code if an axios error is thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.deletePaymentById).mockRejectedValue(axiosError);

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('responds with an error message', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(api.deletePaymentById).mockRejectedValue(new Error('Some error'));

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to delete payment');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
