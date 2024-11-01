import { ObjectId } from 'mongodb';
import { EntityManager } from 'typeorm';
import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  REQUEST_PLATFORM_TYPE,
  UTILISATION_REPORT_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { addFeesToAnExistingPaymentGroup } from './helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { executeWithSqlTransaction } from '../../../../helpers';

jest.mock('../../../../helpers');

describe('post-fees-to-an-existing-payment-group.controller helpers', () => {
  describe('addFeesToAnExistingPaymentGroup', () => {
    const reportId = 1;

    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: new ObjectId().toString(),
    };
    const tfmUserId = tfmUser._id;

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS).withId(reportId).build();
    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

    const feeRecordIds = [1, 2];
    const feeRecords = feeRecordIds.map((id) => FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(id).build());

    const paymentIds = [3, 4];
    const payments = paymentIds.map((id) => PaymentEntityMockBuilder.forCurrency('GBP').withId(id).withFeeRecords([feeRecords[1]]).build());

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
      const feeRecordsToAdd = [feeRecords[0]];
      const existingFeeRecordsInPaymentGroup = [feeRecords[1]];
      await addFeesToAnExistingPaymentGroup(utilisationReport, feeRecordsToAdd, existingFeeRecordsInPaymentGroup, payments, tfmUser);

      // Assert
      expect(utilisationReportStateMachineConstructorSpy).toHaveBeenCalledWith(utilisationReport);
    });

    it('adds the fee records to the existing payment group using the utilisation report state machine', async () => {
      // Act
      const feeRecordsToAdd = [feeRecords[0]];
      const existingFeeRecordsInPaymentGroup = [feeRecords[1]];
      await addFeesToAnExistingPaymentGroup(utilisationReport, feeRecordsToAdd, existingFeeRecordsInPaymentGroup, payments, tfmUser);

      // Assert
      expect(handleEventSpy).toHaveBeenCalledWith({
        type: 'ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP',
        payload: {
          transactionEntityManager: mockEntityManager,
          feeRecordsToAdd,
          existingFeeRecordsInPaymentGroup,
          payments,
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.TFM,
            userId: tfmUserId,
          },
        },
      });
    });
  });
});
