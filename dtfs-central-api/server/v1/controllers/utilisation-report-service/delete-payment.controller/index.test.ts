import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { REQUEST_PLATFORM_TYPE, TestApiError, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { EntityManager } from 'typeorm';
import { DeletePaymentRequest, deletePayment } from '.';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { DeletePaymentPayload } from '../../../routes/middleware/payload-validation/validate-delete-payment-payload';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../../../services/state-machines/utilisation-report/event/utilisation-report.event-type';

jest.mock('../../../../helpers');
jest.mock('../../../../services/state-machines/utilisation-report/utilisation-report.state-machine');

console.error = jest.fn();

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
      utilisationReportRepoFindOneSpy.mockResolvedValue(new UtilisationReportEntityMockBuilder().build());
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

      const utilisationReport = new UtilisationReportEntityMockBuilder().build();
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
        type: UTILISATION_REPORT_EVENT_TYPE.DELETE_PAYMENT,
        payload: {
          transactionEntityManager: mockEntityManager,
          paymentId: Number(paymentId),
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.TFM,
            userId: tfmUserId,
          },
        },
      });
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
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
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
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
      mockHandleEvent.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<DeletePaymentRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      mockHandleEvent.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await deletePayment(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to delete payment with id ${paymentId}: ${errorMessage}`);
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
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
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
      expect(res._getData()).toEqual(`Failed to delete payment with id ${paymentId}`);
    });
  });
});
