import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { PaymentEntityMockBuilder, FeeRecordEntityMockBuilder, ApiError, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { PostRemoveFeesFromPaymentRequest, postRemoveFeesFromPayment } from '.';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { removeFeesFromPayment } from './helpers';
import { PostRemoveFeesFromPaymentPayload } from '../../../routes/middleware/payload-validation/validate-post-remove-fees-from-payment-payload';
import { PaymentRepo } from '../../../../repositories/payment-repo';

jest.mock('./helpers');

class TestApiError extends ApiError {
  constructor(status?: number, message?: string) {
    super({ status: status ?? 500, message: message ?? '' });
  }
}

describe('post-remove-fees-from-payment.controller', () => {
  describe('postRemoveFeesFromPayment', () => {
    const tfmUserId = new ObjectId().toString();
    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    };

    const reportId = 1;
    const paymentId = 2;

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();

    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build(),
    ];

    const payment = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withFeeRecords(feeRecords).build();

    const paymentRepoFindSpy = jest.spyOn(PaymentRepo, 'findOneByIdWithFeeRecordsAndReportFilteredById');

    beforeEach(() => {
      paymentRepoFindSpy.mockResolvedValue(payment);
    });

    const aValidRequestQuery = () => ({
      reportId: reportId.toString(),
      paymentId: paymentId.toString(),
    });

    const selectedFeeRecordIds = [feeRecords[0].id];

    const aValidRequestBody = (): PostRemoveFeesFromPaymentPayload => ({
      selectedFeeRecordIds,
      user: tfmUser,
    });

    it('attempts to remove the selected payment fees using the supplied report id, payment id, fee record ids and user', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(removeFeesFromPayment).mockResolvedValue();

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(removeFeesFromPayment).toHaveBeenCalledWith(utilisationReport, feeRecords, selectedFeeRecordIds, tfmUser);
    });

    it("responds with a '200' if the report is saved successfully", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(removeFeesFromPayment).mockResolvedValue();

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    });

    it("responds with the specific error status if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = 404;
      jest.mocked(removeFeesFromPayment).mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      jest.mocked(removeFeesFromPayment).mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to remove fees from payment with id ${paymentId}: ${errorMessage}`);
    });

    it("responds with a '500' if an unknown error occurs", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(removeFeesFromPayment).mockRejectedValue(new Error('Some error'));

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(removeFeesFromPayment).mockRejectedValue(new Error('Some error'));

      // Act
      await postRemoveFeesFromPayment(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to remove fees from payment with id ${paymentId}`);
    });
  });
});
