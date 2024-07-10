import { ObjectId } from 'mongodb';
import { EntityManager } from 'typeorm';
import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { removeFeesFromPayment, validateAtLeastOneFeeRecordSelected, validateNotAllFeeRecordsSelected } from './helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { executeWithSqlTransaction } from '../../../../helpers';
import { InvalidPayloadError } from '../../../../errors';

jest.mock('../../../../helpers');

describe('post-remove-fees-from-payment.controller helpers', () => {
  describe('removeFeesFromPayment', () => {
    const reportId = 1;

    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: new ObjectId().toString(),
    };
    const tfmUserId = tfmUser._id;

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build(),
    ];

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
      await removeFeesFromPayment(utilisationReport, feeRecords, selectedFeeRecordIds, tfmUser);

      // Assert
      expect(utilisationReportStateMachineConstructorSpy).toHaveBeenCalledWith(utilisationReport);
    });

    it('removes the payment fees using the utilisation report state machine', async () => {
      // Act
      await removeFeesFromPayment(utilisationReport, feeRecords, selectedFeeRecordIds, tfmUser);

      const selectedFeeRecords = [feeRecords[0]];
      const otherFeeRecords = feeRecords.slice(1);

      // Assert
      expect(handleEventSpy).toHaveBeenCalledWith({
        type: 'REMOVE_PAYMENT_FEES',
        payload: {
          transactionEntityManager: mockEntityManager,
          selectedFeeRecords,
          otherFeeRecords,
          requestSource: {
            platform: 'TFM',
            userId: tfmUserId,
          },
        },
      });
    });
  });

  describe('validateAtLeastOneFeeRecordSelected', () => {
    it("throws the 'InvalidPayloadError' if no fee records are selected", () => {
      // Arrange
      const selectedFeeRecordIds: number[] = [];

      // Act / Assert
      expect(() => validateAtLeastOneFeeRecordSelected(selectedFeeRecordIds)).toThrow(InvalidPayloadError);
    });
  });

  describe('validateNotAllFeeRecordsSelected', () => {
    it("throws the 'InvalidPayloadError' if all of the selectable fee records are selected", () => {
      // Arrange
      const selectedFeeRecordIds = [7, 77];
      const totalSelectableFeeRecords = selectedFeeRecordIds.length;

      // Act / Assert
      expect(() => validateNotAllFeeRecordsSelected(selectedFeeRecordIds, totalSelectableFeeRecords)).toThrow(InvalidPayloadError);
    });
  });
});
