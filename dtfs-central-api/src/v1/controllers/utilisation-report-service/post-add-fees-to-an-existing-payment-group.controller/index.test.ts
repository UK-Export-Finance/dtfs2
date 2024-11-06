import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  PaymentEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  TestApiError,
  FEE_RECORD_STATUS,
  RECONCILIATION_IN_PROGRESS,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { PostAddFeesToAnExistingPaymentGroupRequest, postAddFeesToAnExistingPaymentGroup } from '.';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { addFeesToAnExistingPaymentGroup } from './helpers';
import { PostAddFeesToAnExistingPaymentGroupPayload } from '../../../routes/middleware/payload-validation';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

jest.mock('./helpers');

console.error = jest.fn();

describe('post-fees-to-an-existing-payment-group.controller', () => {
  describe('postAddFeesToAnExistingPaymentGroup', () => {
    const tfmUserId = new ObjectId().toString();
    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    };

    const reportId = 1;
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();

    const paymentIds = [3, 4];
    const payments = paymentIds.map((id) => PaymentEntityMockBuilder.forCurrency('GBP').withId(id).withFeeRecords([]).build());

    const aFeeRecordToAdd = FeeRecordEntityMockBuilder.forReport(utilisationReport)
      .withId(1)
      .withPaymentCurrency('GBP')
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .build();
    const aFeeRecordWithPayments = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withPaymentCurrency('GBP').withPayments(payments).build();

    const paymentsWithFeeRecords = paymentIds.map((id) =>
      PaymentEntityMockBuilder.forCurrency('GBP').withId(id).withFeeRecords([aFeeRecordWithPayments]).build(),
    );

    const paymentRepoFindSpy = jest.spyOn(PaymentRepo, 'findPaymentsInGroupByPaymentIdAndReportIdWithFeeRecords');
    const feeRecordRepoFindSpy = jest.spyOn(FeeRecordRepo, 'findByIdAndReportIdWithReport');

    beforeEach(() => {
      paymentRepoFindSpy.mockResolvedValue(paymentsWithFeeRecords);
      feeRecordRepoFindSpy.mockResolvedValue([aFeeRecordToAdd]);
    });

    const aValidRequestQuery = () => ({
      reportId: reportId.toString(),
    });

    const aValidRequestBody = (): PostAddFeesToAnExistingPaymentGroupPayload => ({
      feeRecordIds: [aFeeRecordToAdd.id],
      paymentIds,
      user: tfmUser,
    });

    it('attempts to add the fees to the payment group using the supplied report id, fee record ids, payment ids and user', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addFeesToAnExistingPaymentGroup).mockResolvedValue();

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      const expectedFeeRecordsToAdd = [aFeeRecordToAdd];
      const expectedExistingFeeRecordsInPaymentGroup = [aFeeRecordWithPayments];
      expect(addFeesToAnExistingPaymentGroup).toHaveBeenCalledWith(
        utilisationReport,
        expectedFeeRecordsToAdd,
        expectedExistingFeeRecordsInPaymentGroup,
        paymentsWithFeeRecords,
        tfmUser,
      );
    });

    it("responds with a '200' if the report is saved successfully", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addFeesToAnExistingPaymentGroup).mockResolvedValue();

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it("responds with a '404' if no payments are found with the supplied payment IDs", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      paymentRepoFindSpy.mockResolvedValue([]);

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it("responds with a '400' if no fee records belong to the first payment in the payment group", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: {
          ...aValidRequestBody(),
          feeRecordIds: [aFeeRecordWithPayments.id],
        },
      });
      const res = httpMocks.createResponse();

      paymentRepoFindSpy.mockResolvedValue(payments);

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    });

    it("responds with a '400' if all of the supplied fee record ids already belong to the payment group.", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: {
          ...aValidRequestBody(),
          feeRecordIds: [aFeeRecordWithPayments.id],
        },
      });
      const res = httpMocks.createResponse();

      feeRecordRepoFindSpy.mockResolvedValue([aFeeRecordWithPayments]);

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    });

    it("responds with a '400' if the fee records payment currency does not equal the payment group currency", async () => {
      // Arrange
      const paymentId = 3;
      const feeRecordInExistingPaymentGroup = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withPaymentCurrency('USD').build();
      const existingPayment = PaymentEntityMockBuilder.forCurrency('USD').withId(paymentId).withFeeRecords([feeRecordInExistingPaymentGroup]).build();

      const feeRecordInDifferentCurrencyToExistingPayment = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withId(1)
        .withPaymentCurrency('GBP')
        .withStatus(FEE_RECORD_STATUS.TO_DO)
        .build();

      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: {
          ...aValidRequestBody(),
          feeRecordIds: [feeRecordInDifferentCurrencyToExistingPayment.id],
          paymentIds: [paymentId],
        },
      });
      const res = httpMocks.createResponse();

      paymentRepoFindSpy.mockResolvedValue([existingPayment]);
      feeRecordRepoFindSpy.mockResolvedValue([feeRecordInDifferentCurrencyToExistingPayment]);

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._getData()).toContain('The selected fee records payment currency does not match that of the payment group.');
    });

    it("responds with the specific error status if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = 404;
      jest.mocked(addFeesToAnExistingPaymentGroup).mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      jest.mocked(addFeesToAnExistingPaymentGroup).mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to add fees to an existing payment group: ${errorMessage}`);
    });

    it(`responds with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addFeesToAnExistingPaymentGroup).mockRejectedValue(new Error('Some error'));

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddFeesToAnExistingPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addFeesToAnExistingPaymentGroup).mockRejectedValue(new Error('Some error'));

      // Act
      await postAddFeesToAnExistingPaymentGroup(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to add fees to an existing payment group');
    });
  });
});
