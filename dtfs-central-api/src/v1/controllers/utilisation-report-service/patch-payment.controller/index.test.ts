import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { EntityManager } from 'typeorm';
import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { patchPayment } from '.';
import { PatchPaymentPayload } from '../../../routes/middleware/payload-validation';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { PaymentRepo } from '../../../../repositories/payment-repo';

jest.mock('../../../../helpers');

console.error = jest.fn();

describe('patch-payment.controller', () => {
  describe('patchPayment', () => {
    const reportId = 12;
    const paymentId = 31;

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId: reportId.toString(), paymentId: paymentId.toString() },
        body: aPatchPaymentRequestBody(),
      });

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();

    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build(),
    ];

    const payment = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withFeeRecords(feeRecords).build();

    const paymentRepoFindSpy = jest.spyOn(PaymentRepo, 'findOneByIdWithFeeRecordsAndReportFilteredById');
    const utilisationReportStateMachineConstructorSpy = jest.spyOn(UtilisationReportStateMachine, 'forReport');

    const mockEventHandler = jest.fn();
    const mockUtilisationReportStateMachine = {
      handleEvent: mockEventHandler,
    } as unknown as UtilisationReportStateMachine;

    const mockEntityManager = {} as unknown as EntityManager;

    beforeEach(() => {
      paymentRepoFindSpy.mockResolvedValue(payment);
      utilisationReportStateMachineConstructorSpy.mockReturnValue(mockUtilisationReportStateMachine);

      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
        await functionToExecute(mockEntityManager);
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with a 404 (Not Found) when the payment with the supplied id cannot be found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      paymentRepoFindSpy.mockResolvedValue(null);

      // Act
      await patchPayment(req, res);

      // Assert
      expect(paymentRepoFindSpy).toHaveBeenCalledWith(paymentId, reportId);
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it('responds with a 500 (Internal Server Error) when an unexpected error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      mockEventHandler.mockRejectedValue(new Error('Some error'));

      // Act
      await patchPayment(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('responds with a 200 and updates the payment', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const userId = 'abc123';
      const paymentAmount = 314.59;
      const datePaymentReceived = new Date();
      const paymentReference = 'Some payment reference';
      const requestBody: PatchPaymentPayload = {
        paymentAmount,
        datePaymentReceived,
        paymentReference,
        user: { ...aTfmSessionUser(), _id: userId },
      };
      req.body = requestBody;

      mockEventHandler.mockResolvedValue(utilisationReport);

      // Act
      await patchPayment(req, res);

      // Assert
      expect(utilisationReportStateMachineConstructorSpy).toHaveBeenCalledWith(utilisationReport);
      expect(mockEventHandler).toHaveBeenCalledWith({
        type: 'EDIT_PAYMENT',
        payload: {
          transactionEntityManager: mockEntityManager,
          payment,
          feeRecords,
          paymentAmount,
          datePaymentReceived,
          paymentReference,
          requestSource: {
            platform: 'TFM',
            userId,
          },
        },
      });
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    function aPatchPaymentRequestBody(): PatchPaymentPayload {
      return {
        paymentAmount: 100,
        datePaymentReceived: new Date(),
        paymentReference: 'A reference',
        user: aTfmSessionUser(),
      };
    }
  });
});
