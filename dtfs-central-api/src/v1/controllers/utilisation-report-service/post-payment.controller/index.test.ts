import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { Currency, CURRENCY, FEE_RECORD_STATUS, TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { PostPaymentRequest, postPayment } from '.';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { addPaymentToUtilisationReport } from './helpers';
import { PostPaymentPayload } from '../../../routes/middleware/payload-validation/validate-post-payment-payload';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';

jest.mock('./helpers');

console.error = jest.fn();

describe('post-payment.controller', () => {
  describe('postPayment', () => {
    const tfmUserId = new ObjectId().toString();
    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    };

    const reportId = 1;

    const aValidRequestQuery = () => ({ reportId: reportId.toString() });

    const feeRecordIds = [1, 2, 3];
    const paymentCurrency: Currency = CURRENCY.GBP;
    const paymentAmount = 100;
    const datePaymentReceived = new Date();
    const paymentReference = 'A payment reference';

    const aValidRequestBody = (): PostPaymentPayload => ({
      feeRecordIds,
      user: tfmUser,
      paymentCurrency,
      paymentAmount,
      datePaymentReceived,
      paymentReference,
    });

    it('attempts to save the payment using the supplied report id, fee record ids, user and the new payment', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addPaymentToUtilisationReport).mockResolvedValue(FEE_RECORD_STATUS.MATCH);

      const newPaymentDetails: NewPaymentDetails = {
        currency: paymentCurrency,
        amount: paymentAmount,
        dateReceived: datePaymentReceived,
        reference: paymentReference,
      };

      // Act
      await postPayment(req, res);

      // Assert
      expect(addPaymentToUtilisationReport).toHaveBeenCalledWith(reportId, feeRecordIds, tfmUser, newPaymentDetails);
    });

    it("responds with a '200' and fee record status if the report is saved successfully", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addPaymentToUtilisationReport).mockResolvedValue(FEE_RECORD_STATUS.MATCH);

      // Act
      await postPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({ feeRecordStatus: FEE_RECORD_STATUS.MATCH });
    });

    it("responds with the specific error status if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = HttpStatusCode.NotFound;
      jest.mocked(addPaymentToUtilisationReport).mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await postPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      jest.mocked(addPaymentToUtilisationReport).mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await postPayment(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to add a new payment: ${errorMessage}`);
    });

    it(`responds with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PostPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addPaymentToUtilisationReport).mockRejectedValue(new Error('Some error'));

      // Act
      await postPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addPaymentToUtilisationReport).mockRejectedValue(new Error('Some error'));

      // Act
      await postPayment(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to add a new payment');
    });
  });
});
