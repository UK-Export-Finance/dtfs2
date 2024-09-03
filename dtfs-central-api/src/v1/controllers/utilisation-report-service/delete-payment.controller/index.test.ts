import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { ApiError, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { EntityManager } from 'typeorm';
import { DeletePaymentRequest, deletePayment } from '.';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { DeletePaymentPayload } from '../../../routes/middleware/payload-validation/validate-delete-payment-payload';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

jest.mock('../../../../helpers');
jest.mock('../../../../services/state-machines/utilisation-report/utilisation-report.state-machine');

console.error = jest.fn();

class TestApiError extends ApiError {
  constructor(status?: number, message?: string) {
    super({ status: status ?? 500, message: message ?? '' });
  }
}

describe('delete-payment.controller', () => {
  describe('deletePayment', () => {
    const tfmUserId = new ObjectId().toString();

    const reportId = 1;
    const paymentId = 2;

    const aValidRequestQuery = () => ({ reportId: reportId.toString(), paymentId: paymentId.toString() });

    const aValidRequestBody = (): DeletePaymentPayload => ({
      user: { ...aTfmSessionUser(), _id: tfmUserId },
    });

    const utilisationReportRepoFindOneSpy = jest.spyOn(UtilisationReportRepo, 'findOne');

    const mockEntityManager = {} as unknown as EntityManager;
    const mockHandleEvent = jest.fn();
    const mockForReport = jest.fn();

    beforeEach(() => {
      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
        await functionToExecute(mockEntityManager);
      });
      mockForReport.mockReturnValue({
        handleEvent: mockHandleEvent,
      });
      UtilisationReportStateMachine.forReport = mockForReport;
      utilisationReportRepoFindOneSpy.mockResolvedValue(aUtilisationReport());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('deletes the payment and responds with 200', async () => {
      // Arrange
      const req = httpMocks.createRequest<DeletePaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const utilisationReport = aUtilisationReport();
      utilisationReportRepoFindOneSpy.mockResolvedValue(utilisationReport);

      // Act
      await deletePayment(req, res);

      // Assert
      expect(utilisationReportRepoFindOneSpy).toHaveBeenCalledWith({
        where: {
          id: reportId,
          feeRecords: {
            payments: {
              id: paymentId,
            },
          },
        },
      });
      expect(mockForReport).toHaveBeenCalledTimes(1);
      expect(mockForReport).toHaveBeenCalledWith(utilisationReport);
      expect(mockHandleEvent).toHaveBeenCalledTimes(1);
      expect(mockHandleEvent).toHaveBeenCalledWith({
        type: 'DELETE_PAYMENT',
        payload: {
          transactionEntityManager: mockEntityManager,
          paymentId: Number(paymentId),
          requestSource: {
            platform: 'TFM',
            userId: tfmUserId,
          },
        },
      });
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    });

    it('responds with a 404 (Not Found) error if a report with the supplied report and payment id cannot be found', async () => {
      // Arrange
      const req = httpMocks.createRequest<DeletePaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      utilisationReportRepoFindOneSpy.mockResolvedValue(null);

      // Act
      await deletePayment(req, res);

      // Assert
      expect(utilisationReportRepoFindOneSpy).toHaveBeenCalledWith({
        where: {
          id: reportId,
          feeRecords: {
            payments: {
              id: paymentId,
            },
          },
        },
      });
      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._getData()).toEqual(expect.stringContaining(`Failed to find a report with id '${reportId}' with attached payment with id '${paymentId}'`));
    });

    it("responds with the specific error status if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<DeletePaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = 404;
      mockHandleEvent.mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<DeletePaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      mockHandleEvent.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to delete payment with id ${paymentId}: ${errorMessage}`);
    });

    it(`responds with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<DeletePaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      mockHandleEvent.mockRejectedValue(new Error('Some error'));

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<DeletePaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      mockHandleEvent.mockRejectedValue(new Error('Some error'));

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getData()).toBe(`Failed to delete payment with id ${paymentId}`);
    });

    function aUtilisationReport(): UtilisationReportEntity {
      return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    }
  });
});
