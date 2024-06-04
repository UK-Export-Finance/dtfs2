import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { ApiError, Currency } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { PostAddPaymentRequest, postAddPayment } from '.';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { addPaymentToUtilisationReport } from './helpers';
import { PostAddPaymentPayload } from '../../../routes/middleware/payload-validation/validate-post-add-payment-payload';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';

jest.mock('./helpers');

class TestApiError extends ApiError {
  constructor(status?: number, message?: string) {
    super({ status: status ?? 500, message: message ?? '' });
  }
}

describe('post-add-payment.controller', () => {
  describe('postAddPayment', () => {
    const tfmUserId = new ObjectId().toString();
    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    };

    const reportId = 1;

    const aValidRequestQuery = () => ({ reportId: reportId.toString() });

    const feeRecordIds = [1, 2, 3];
    const paymentCurrency: Currency = 'GBP';
    const paymentAmount = 100;
    const datePaymentReceived = new Date();
    const paymentReference = 'A payment reference';

    const aValidRequestBody = (): PostAddPaymentPayload => ({
      feeRecordIds,
      user: tfmUser,
      paymentCurrency,
      paymentAmount,
      datePaymentReceived,
      paymentReference,
    });

    it("calls the 'addPaymentToUtilisationReport' helper function with the report id, fee record ids, user and the new payment", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addPaymentToUtilisationReport).mockResolvedValue();

      const newPaymentDetails: NewPaymentDetails = {
        currency: paymentCurrency,
        amountReceived: paymentAmount,
        dateReceived: datePaymentReceived,
        paymentReference,
      };

      // Act
      await postAddPayment(req, res);

      // Assert
      expect(addPaymentToUtilisationReport).toHaveBeenCalledWith(reportId, feeRecordIds, tfmUser, newPaymentDetails);
    });

    it("responds with a '200' if 'addPaymentToUtilisationReport' does not throw any errors", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addPaymentToUtilisationReport).mockResolvedValue();

      // Act
      await postAddPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    });

    it("responds with the specific error status if 'addPaymentToUtilisationReport' throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = 404;
      jest.mocked(addPaymentToUtilisationReport).mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await postAddPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
    });

    it("responds with the specific error message if 'addPaymentToUtilisationReport' throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      jest.mocked(addPaymentToUtilisationReport).mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await postAddPayment(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to add a new payment: ${errorMessage}`);
    });

    it("responds with a '500' if an unknown error occurs", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addPaymentToUtilisationReport).mockRejectedValue(new Error('Some error'));

      // Act
      await postAddPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostAddPaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      jest.mocked(addPaymentToUtilisationReport).mockRejectedValue(new Error('Some error'));

      // Act
      await postAddPayment(req, res);

      // Assert
      expect(res._getData()).toBe('Failed to add a new payment');
    });
  });
});
