import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  CURRENCY,
  PaymentEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  TestApiError,
  RECONCILIATION_IN_PROGRESS,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { PostRemoveFeesFromPaymentGroupRequest, postRemoveFeesFromPaymentGroup } from '.';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { removeFeesFromPaymentGroup } from './helpers';
import { PostRemoveFeesFromPaymentGroupPayload } from '../../../routes/middleware/payload-validation/validate-post-remove-fees-from-payment-group-payload';
import { PaymentRepo } from '../../../../repositories/payment-repo';

jest.mock('./helpers');

console.error = jest.fn();

describe('post-remove-fees-from-payment-group.controller', () => {
  describe('postRemoveFeesFromPaymentGroup', () => {
    const tfmUserId = new ObjectId().toString();
    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    };

    const reportId = 1;
    const paymentId = 2;

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();

    const feeRecordIds = [1, 2];
    const feeRecords = feeRecordIds.map((id) => FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(id).build());

    const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(paymentId).withFeeRecords(feeRecords).build();

    const paymentRepoFindSpy = jest.spyOn(PaymentRepo, 'findOneByIdWithFeeRecordsAndReportFilteredById');

    beforeEach(() => {
      paymentRepoFindSpy.mockResolvedValue(payment);
    });

    const aValidRequestQuery = () => ({
      reportId: reportId.toString(),
      paymentId: paymentId.toString(),
    });

    const aValidRequestBody = (): PostRemoveFeesFromPaymentGroupPayload => ({
      selectedFeeRecordIds: [feeRecordIds[0]],
      user: tfmUser,
    });

    it('attempts to remove the selected payment fees using the supplied report id, payment id, fee record ids and user', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(removeFeesFromPaymentGroup).mockResolvedValue();

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      const expectedFeeRecordsToRemove = [feeRecords[0]];
      const expectedOtherFeeRecordsInGroup = [feeRecords[1]];
      expect(removeFeesFromPaymentGroup).toHaveBeenCalledWith(utilisationReport, expectedFeeRecordsToRemove, expectedOtherFeeRecordsInGroup, tfmUser);
    });

    it("responds with a '200' if the report is saved successfully", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(removeFeesFromPaymentGroup).mockResolvedValue();

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it("responds with a '400' if no matching fee records are found on the payment", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: {
          ...aValidRequestBody(),
          selectedFeeRecordIds: [7777],
        },
      });
      const res = httpMocks.createResponse();

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    });

    it("responds with a '400' if all of the payments fee records are selected", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: {
          ...aValidRequestBody(),
          selectedFeeRecordIds: feeRecordIds,
        },
      });
      const res = httpMocks.createResponse();

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    });

    it("responds with the specific error status if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = 404;
      jest.mocked(removeFeesFromPaymentGroup).mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      jest.mocked(removeFeesFromPaymentGroup).mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to remove fees from payment with id ${paymentId}: ${errorMessage}`);
    });

    it(`responds with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(removeFeesFromPaymentGroup).mockRejectedValue(new Error('Some error'));

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostRemoveFeesFromPaymentGroupRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(removeFeesFromPaymentGroup).mockRejectedValue(new Error('Some error'));

      // Act
      await postRemoveFeesFromPaymentGroup(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to remove fees from payment with id ${paymentId}`);
    });
  });
});
