import { EntityManager } from 'typeorm';
import { UtilisationReportEntityMockBuilder, DbRequestSource, FeeRecordEntityMockBuilder, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { handleUtilisationReportRemoveFeesFromPaymentEvent } from './remove-fees-from-payment.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

jest.mock('../helpers');

describe('handleUtilisationReportRemoveFeesFromPaymentEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const aReconciliationInProgressReport = () => UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

  const aFeeRecordForReport = (report: UtilisationReportEntity, id: number) => FeeRecordEntityMockBuilder.forReport(report).withId(id).build();

  const aMockEventHandler = () => jest.fn();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  beforeEach(() => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each([
    [true, 'the fee records match the payments'],
    [false, 'the fee records do not match the payments'],
  ])(
    "calls the fee record state machine event handlers with 'feeRecordsAndPaymentsMatch' set to %s if %s",
    async (feeRecordsMatchAttachedPaymentsFlag: boolean) => {
      // Arrange
      const utilisationReport = aReconciliationInProgressReport();

      const feeRecordIds = [1, 2, 3, 4];
      const feeRecords = feeRecordIds.map((id) => aFeeRecordForReport(utilisationReport, id));
      const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
      const feeRecordStateMachines = feeRecords.reduce(
        (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
        {} as { [id: number]: FeeRecordStateMachine },
      );

      const selectedFeeRecords = feeRecords.slice(0, 2);
      const otherFeeRecords = feeRecords.slice(2);

      jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

      jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(feeRecordsMatchAttachedPaymentsFlag);

      // Act
      await handleUtilisationReportRemoveFeesFromPaymentEvent(utilisationReport, {
        transactionEntityManager: mockEntityManager,
        selectedFeeRecords,
        otherFeeRecords,
        requestSource,
      });

      // Assert
      selectedFeeRecords.forEach(({ id }) => {
        const eventHandler = eventHandlers[id];
        expect(eventHandler).toHaveBeenCalledWith({
          type: 'REMOVE_FROM_PAYMENT',
          payload: {
            transactionEntityManager: mockEntityManager,
            requestSource,
          },
        });
      });

      otherFeeRecords.forEach(({ id }) => {
        const eventHandler = eventHandlers[id];
        expect(eventHandler).toHaveBeenCalledWith({
          type: 'OTHER_FEE_REMOVED_FROM_GROUP',
          payload: {
            transactionEntityManager: mockEntityManager,
            feeRecordsAndPaymentsMatch: feeRecordsMatchAttachedPaymentsFlag,
            requestSource,
          },
        });
      });
    },
  );

  it('updates and saves the updated report', async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();

    // Act
    await handleUtilisationReportRemoveFeesFromPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      selectedFeeRecords: [],
      otherFeeRecords: [],
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
    expect(utilisationReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(utilisationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(utilisationReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
  });
});
