import { ObjectId } from 'mongodb';
import { In } from 'typeorm';
import { ApiError, Currency, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { addPaymentToUtilisationReport } from './helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { InvalidPayloadError, NotFoundError, TransactionFailedError } from '../../../../errors';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { getMockQueryRunner } from '../../../../../test-helpers/mock-query-runner';
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
      amountReceived: 100,
      dateReceived: new Date(),
      paymentReference: 'A payment reference',
    };

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

    const feeRecordsInPaymentCurrency = feeRecordIds.map((feeRecordId) =>
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(feeRecordId).withPaymentCurrency(paymentCurrency).build(),
    );

    const mockQueryRunner = getMockQueryRunner();
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

    it("calls the 'UtilisationReportStateMachine.forReportId' method with the supplied report id", async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(utilisationReportStateMachineConstructorSpy).toHaveBeenCalledWith(reportId);
    });

    it("calls the 'FeeRecordRepo.findBy' method with the supplied list of fee record ids", async () => {
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

    it("calls the 'queryRunner.connect' method", async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(mockQueryRunner.connect).toHaveBeenCalled();
    });

    it("calls the 'queryRunner.startTransaction' method", async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    });

    it("calls the 'UtilisationReportStateMachine.handleEvent' function with the 'ADD_A_PAYMENT' event and payload", async () => {
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

    it("calls the 'queryRunner.commitTransaction' method if the event handler runs successfully", async () => {
      // Arrange
      handleEventSpy.mockResolvedValue(utilisationReport);

      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it("calls the 'queryRunner.rollbackTransaction' method if the event handler throws an error", async () => {
      // Arrange
      handleEventSpy.mockRejectedValue(new Error('Some error'));

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it("does not call the 'queryRunner.commitTransaction' method if the event handler throws an error", async () => {
      // Arrange
      handleEventSpy.mockRejectedValue(new Error('Some error'));

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
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

    it("calls the 'queryRunner.release' method if the event handler runs successfully", async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it("calls the 'queryRunner.release' method if the event handler throws an error", async () => {
      // Arrange
      handleEventSpy.mockRejectedValue(new Error('Some error'));

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
