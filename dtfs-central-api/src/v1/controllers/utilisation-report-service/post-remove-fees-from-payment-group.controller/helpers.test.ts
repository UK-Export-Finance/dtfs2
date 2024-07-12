import { ObjectId } from 'mongodb';
import { EntityManager } from 'typeorm';
import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import {
  removeFeesFromPaymentGroup,
  validateNotAllFeeRecordsSelected,
  validateSelectedFeeRecordsDoesNotExceedTotal,
  validateSelectedFeeRecordsExistInPayment,
} from './helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { executeWithSqlTransaction } from '../../../../helpers';
import { InvalidPayloadError } from '../../../../errors';

jest.mock('../../../../helpers');

describe('post-remove-fees-from-payment.controller helpers', () => {
  describe('removeFeesFromPaymentGroup', () => {
    const reportId = 1;

    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: new ObjectId().toString(),
    };
    const tfmUserId = tfmUser._id;

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

    const feeRecordIds = [1, 2];
    const feeRecords = feeRecordIds.map((id) => FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(id).build());

    const selectedFeeRecordIds = [feeRecords[0].id];

    const utilisationReportStateMachineConstructorSpy = jest.spyOn(UtilisationReportStateMachine, 'forReport');
    const handleEventSpy = jest.spyOn(utilisationReportStateMachine, 'handleEvent');

    const mockEntityManager = {
      save: jest.fn(),
      find: jest.fn(),
    } as unknown as EntityManager;

    beforeEach(() => {
      utilisationReportStateMachineConstructorSpy.mockReturnValue(utilisationReportStateMachine);
      handleEventSpy.mockResolvedValue(utilisationReport);

      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
        await functionToExecute(mockEntityManager);
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('initialises a utilisation report state machine with the supplied report', async () => {
      // Act
      await removeFeesFromPaymentGroup(utilisationReport, feeRecords, selectedFeeRecordIds, tfmUser);

      // Assert
      expect(utilisationReportStateMachineConstructorSpy).toHaveBeenCalledWith(utilisationReport);
    });

    it('removes the payment fees using the utilisation report state machine', async () => {
      // Act
      await removeFeesFromPaymentGroup(utilisationReport, feeRecords, selectedFeeRecordIds, tfmUser);

      // Assert
      const expectedFeeRecordsToRemove = feeRecords.slice(0, 1);
      const expectedFeeRecordsToUpdate = feeRecords.slice(1);
      expect(handleEventSpy).toHaveBeenCalledWith({
        type: 'REMOVE_FEES_FROM_PAYMENT_GROUP',
        payload: {
          transactionEntityManager: mockEntityManager,
          feeRecordsToRemove: expectedFeeRecordsToRemove,
          feeRecordsToUpdate: expectedFeeRecordsToUpdate,
          requestSource: {
            platform: 'TFM',
            userId: tfmUserId,
          },
        },
      });
    });
  });

  describe('validateSelectedFeeRecordsExistInPayment', () => {
    const reportId = 1;
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();

    const createPaymentFeeRecords = (paymentFeeRecordIds: number[]) =>
      paymentFeeRecordIds.map((id) => FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(id).build());

    it('does not throw an error when all selected fee records exist in the payment', () => {
      // Arrange
      const paymentFeeRecordIds = [1, 2, 3];
      const paymentFeeRecords = createPaymentFeeRecords(paymentFeeRecordIds);

      const selectedFeeRecordIds = paymentFeeRecordIds.slice(0, 2);

      // Act / Assert
      expect(() => validateSelectedFeeRecordsExistInPayment(selectedFeeRecordIds, paymentFeeRecords)).not.toThrow();
    });

    it("throws the 'InvalidPayloadError' if the selected fee records don't exist in the payment", () => {
      // Arrange
      const paymentFeeRecordIds = [1, 2];
      const paymentFeeRecords = createPaymentFeeRecords(paymentFeeRecordIds);

      const selectedFeeRecordIds = [1, 7];

      // Act / Assert
      expect(() => validateSelectedFeeRecordsExistInPayment(selectedFeeRecordIds, paymentFeeRecords)).toThrow(InvalidPayloadError);
    });
  });

  describe('validateNotAllFeeRecordsSelected', () => {
    it("throws the 'InvalidPayloadError' if all of the selectable fee records are selected", () => {
      // Arrange
      const selectedFeeRecordIds = [7, 77];
      const totalFeeRecordsOnPayment = selectedFeeRecordIds.length;

      // Act / Assert
      expect(() => validateNotAllFeeRecordsSelected(selectedFeeRecordIds, totalFeeRecordsOnPayment)).toThrow(InvalidPayloadError);
    });
  });

  describe('validateSelectedFeeRecordsDoesNotExceedTotal', () => {
    it("throws the 'InvalidPayloadError' if more fee records are selected than the total number of fee records on the payment", () => {
      // Arrange
      const selectedFeeRecordIds = [7, 77];
      const totalFeeRecordsOnPayment = selectedFeeRecordIds.length - 1;

      // Act / Assert
      expect(() => validateSelectedFeeRecordsDoesNotExceedTotal(selectedFeeRecordIds, totalFeeRecordsOnPayment)).toThrow(InvalidPayloadError);
    });
  });
});
