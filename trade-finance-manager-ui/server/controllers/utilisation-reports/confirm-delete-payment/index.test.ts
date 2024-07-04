import httpMocks from 'node-mocks-http';
import { getConfirmDeletePayment, postConfirmDeletePayment } from '.';
import api from '../../../api';
import { ConfirmDeletePaymentViewModel } from '../../../types/view-models';
import { aPayment, aPaymentDetailsWithoutFeeRecordsResponseBody, aTfmSessionUser } from '../../../../test-helpers';
import { GetPaymentDetailsWithoutFeeRecordsResponseBody } from '../../../api-response-types';

console.error = jest.fn();

jest.mock('../../../api');

describe('controllers/utilisation-reports/confirm-delete-payment', () => {
  const requestSession = {
    user: aTfmSessionUser(),
    userToken: 'abc123',
  };

  describe('getConfirmDeletePayment', () => {
    const reportId = '1';
    const paymentId = '2';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        session: requestSession,
        params: {
          reportId,
          paymentId,
        },
      });

    beforeEach(() => {
      jest.mocked(api.getPaymentDetailsWithoutFeeRecords).mockResolvedValue(aPaymentDetailsWithoutFeeRecordsResponseBody());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('gets the payment details and renders the confirm delete payment page', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getConfirmDeletePayment(req, res);

      // Assert
      expect(api.getPaymentDetailsWithoutFeeRecords).toHaveBeenCalledWith(reportId, paymentId, requestSession.userToken);
      expect(res._getRenderView()).toBe('utilisation-reports/confirm-delete-payment.njk');
    });

    it('renders the confirm delete payment page with the payment summary list rows', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getConfirmDeletePayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as ConfirmDeletePaymentViewModel;
      expect(viewModel.paymentSummaryListRows).toHaveLength(3);
    });

    it("renders the confirm delete payment page with the 'Amount' key-value pair at row index 0", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody: GetPaymentDetailsWithoutFeeRecordsResponseBody = {
        ...aPaymentDetailsWithoutFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          currency: 'GBP',
          amount: 100,
        },
      };
      jest.mocked(api.getPaymentDetailsWithoutFeeRecords).mockResolvedValue(responseBody);

      // Act
      await getConfirmDeletePayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as ConfirmDeletePaymentViewModel;
      expect(viewModel.paymentSummaryListRows[0]).toEqual({
        key: { text: 'Amount' },
        value: { text: 'GBP 100.00' },
      });
    });

    it("renders the confirm delete payment page with the 'Payment reference' key-value pair at row index 1", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody: GetPaymentDetailsWithoutFeeRecordsResponseBody = {
        ...aPaymentDetailsWithoutFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          reference: 'Some reference',
        },
      };
      jest.mocked(api.getPaymentDetailsWithoutFeeRecords).mockResolvedValue(responseBody);

      // Act
      await getConfirmDeletePayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as ConfirmDeletePaymentViewModel;
      expect(viewModel.paymentSummaryListRows[1]).toEqual({
        key: { text: 'Payment reference' },
        value: { text: 'Some reference' },
      });
    });

    it("renders the confirm delete payment page with the 'Date received' key-value pair at row index 2", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const responseBody: GetPaymentDetailsWithoutFeeRecordsResponseBody = {
        ...aPaymentDetailsWithoutFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          dateReceived: '2024-06-19T12:00:00.000',
        },
      };
      jest.mocked(api.getPaymentDetailsWithoutFeeRecords).mockResolvedValue(responseBody);

      // Act
      await getConfirmDeletePayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as ConfirmDeletePaymentViewModel;
      expect(viewModel.paymentSummaryListRows[2]).toEqual({
        key: { text: 'Date received' },
        value: { text: '19 Jun 2024' },
      });
    });
  });

  describe('postConfirmDeletePayment', () => {
    beforeEach(() => {
      jest.mocked(api.deletePaymentById);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe("when 'confirmDeletePayment' is set to 'yes'", () => {
      const reportId = '5';
      const paymentId = '6';

      const getHttpMocks = () =>
        httpMocks.createMocks({
          session: requestSession,
          params: { reportId, paymentId },
          body: { confirmDeletePayment: 'yes' },
        });

      it('deletes the payment', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postConfirmDeletePayment(req, res);

        // Assert
        expect(api.deletePaymentById).toHaveBeenCalledWith(reportId, paymentId, requestSession.user, requestSession.userToken);
      });

      it('redirects to the premium payments page', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postConfirmDeletePayment(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}`);
      });
    });

    describe("when 'confirmDeletePayment' is set to 'no'", () => {
      const reportId = '5';
      const paymentId = '6';

      const getHttpMocks = () =>
        httpMocks.createMocks({
          session: requestSession,
          params: { reportId, paymentId },
          body: { confirmDeletePayment: 'no' },
        });

      it('does not delete the payment', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postConfirmDeletePayment(req, res);

        // Assert
        expect(api.deletePaymentById).not.toHaveBeenCalled();
      });

      it('redirects to the edit payment url with the same report id and payment id specified in the request params', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postConfirmDeletePayment(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
      });
    });

    it('renders the problem with service page when an error occurs', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1', paymentId: '1' },
        body: { confirmDeletePayment: 'yes' },
      });

      jest.mocked(api.deletePaymentById).mockRejectedValue(new Error('Some error'));

      // Act
      await postConfirmDeletePayment(req, res);

      // Assert
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });
  });
});
