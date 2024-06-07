import { ObjectId } from 'mongodb';
import { In } from 'typeorm';
import { ApiError, Currency, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { addPaymentToUtilisationReport } from './helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { InvalidPayloadError, NotFoundError, TransactionFailedError } from '../../../../errors';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { getQueryRunnerMocks } from '../../../../../test-helpers/mock-query-runner';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';

describe('post-add-payment.controller helpers', () => {
  describe('addPaymentToUtilisationReport', () => {
    const reportId = 1;
    const feeRecordIds = [1, 2, 3];
    const paymentCurrency: Currency = 'GBP';

    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: new ObjectId().toString(),
    };
    const tfmUserId = tfmUser._id;

    const newPaymentDetails: NewPaymentDetails = {
      currency: paymentCurrency,
      amount: 100,
      dateReceived: new Date(),
      reference: 'A payment reference',
    };

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

    const feeRecordsInPaymentCurrency = feeRecordIds.map((feeRecordId) =>
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(feeRecordId).withPaymentCurrency(paymentCurrency).build(),
    );

    const { mockQueryRunner, mockConnect, mockStartTransaction, mockCommitTransaction, mockRollbackTransaction, mockRelease } = getQueryRunnerMocks();
    const feeRecordFindBySpy = jest.spyOn(FeeRecordRepo, 'findBy');
    const createQueryRunnerSpy = jest.spyOn(SqlDbDataSource, 'createQueryRunner');

    const utilisationReportStateMachineConstructorSpy = jest.spyOn(UtilisationReportStateMachine, 'forReportId');
    const handleEventSpy = jest.spyOn(utilisationReportStateMachine, 'handleEvent');

    beforeEach(() => {
      feeRecordFindBySpy.mockResolvedValue(feeRecordsInPaymentCurrency);
      createQueryRunnerSpy.mockReturnValue(mockQueryRunner);
      utilisationReportStateMachineConstructorSpy.mockResolvedValue(utilisationReportStateMachine);
      handleEventSpy.mockResolvedValue(utilisationReport);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('initialises a utilisation report state machine with the supplied report id', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(utilisationReportStateMachineConstructorSpy).toHaveBeenCalledWith(reportId);
    });

    it('attempts to find all the fee records which have the id specified by the supplied feeRecordIds list', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(feeRecordFindBySpy).toHaveBeenCalledWith({ id: In(feeRecordIds) });
    });

    it("throws the 'NotFoundError' if no fee records are found", async () => {
      // Arrange
      feeRecordFindBySpy.mockResolvedValue([]);

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow(NotFoundError);
    });

    it("throws the 'InvalidPayloadError' if the payment currency does not match the fee record payment currencies", async () => {
      // Arrange
      const feeRecordsWithGBPPaymentCurrency = feeRecordIds.map((feeRecordId) =>
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(feeRecordId).withPaymentCurrency('GBP').build(),
      );
      feeRecordFindBySpy.mockResolvedValue(feeRecordsWithGBPPaymentCurrency);

      const newPaymentDetailsWithEURCurrency: NewPaymentDetails = {
        ...newPaymentDetails,
        currency: 'EUR',
      };

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetailsWithEURCurrency)).rejects.toThrow(InvalidPayloadError);
    });

    it("throws the 'InvalidPayloadError' if the payment currency matches all but one of the fee record payment currencies", async () => {
      // Arrange
      const feeRecordsWithGBPPaymentCurrency = feeRecordIds.map((feeRecordId) =>
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(feeRecordId).withPaymentCurrency('GBP').build(),
      );
      const feeRecordWithEURPaymentCurrency = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(100).withPaymentCurrency('EUR').build();
      feeRecordFindBySpy.mockResolvedValue([...feeRecordsWithGBPPaymentCurrency, feeRecordWithEURPaymentCurrency]);

      const newPaymentDetailsWithGBPCurrency: NewPaymentDetails = {
        ...newPaymentDetails,
        currency: 'GBP',
      };

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetailsWithGBPCurrency)).rejects.toThrow(InvalidPayloadError);
    });

    it('creates a database connection for the transaction', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(mockConnect).toHaveBeenCalled();
    });

    it('starts the transaction', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(mockStartTransaction).toHaveBeenCalled();
    });

    it('adds the payment to the utilisation report using the utilisation report state machine', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(handleEventSpy).toHaveBeenCalledWith({
        type: 'ADD_A_PAYMENT',
        payload: {
          transactionEntityManager: mockQueryRunner.manager,
          feeRecords: feeRecordsInPaymentCurrency,
          paymentDetails: newPaymentDetails,
          requestSource: {
            platform: 'TFM',
            userId: tfmUserId,
          },
        },
      });
    });

    it('commits the transaction if the utilisation report state machine event handler runs successfully', async () => {
      // Arrange
      handleEventSpy.mockResolvedValue(utilisationReport);

      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(mockCommitTransaction).toHaveBeenCalled();
    });

    it('rolls back the transaction if the utilisation report state machine event handler throws an error', async () => {
      // Arrange
      handleEventSpy.mockRejectedValue(new Error('Some error'));

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow();
      expect(mockRollbackTransaction).toHaveBeenCalled();
    });

    it('does not commit the transaction if the utilisation report state machine event handler throws an error', async () => {
      // Arrange
      handleEventSpy.mockRejectedValue(new Error('Some error'));

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow();
      expect(mockRollbackTransaction).toHaveBeenCalled();
    });

    it("throws the 'TransactionFailedError' with the generic 'Unknown error' message if an unexpected error occurred", async () => {
      // Arrange
      handleEventSpy.mockRejectedValue(new Error('Some error'));

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow(
        new TransactionFailedError('Unknown error'),
      );
    });

    it("throws the 'TransactionFailedError' with the specific error message if the event handler throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some specific error';
      class TestError extends ApiError {
        constructor() {
          super({
            status: 400,
            message: errorMessage,
          });
        }
      }
      handleEventSpy.mockRejectedValue(new TestError());

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow(new TransactionFailedError(errorMessage));
    });

    it('releases the connection used for the transaction if the event handler runs successfully', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(mockRelease).toHaveBeenCalled();
    });

    it('releases the connection used for the transaction if the event handler throws an error', async () => {
      // Arrange
      handleEventSpy.mockRejectedValue(new Error('Some error'));

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow();
      expect(mockRelease).toHaveBeenCalled();
    });
  });
});
