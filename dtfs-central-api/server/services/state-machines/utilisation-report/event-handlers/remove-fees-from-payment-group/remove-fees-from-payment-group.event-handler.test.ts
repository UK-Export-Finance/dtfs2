import { UtilisationReportEntityMockBuilder, FeeRecordEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { EntityManager } from 'typeorm';
import { DbRequestSource, UtilisationReportEntity, REQUEST_PLATFORM_TYPE, RECONCILIATION_IN_PROGRESS } from '@ukef/dtfs2-common';
import { handleUtilisationReportRemoveFeesFromPaymentGroupEvent } from './remove-fees-from-payment-group.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';
import { FEE_RECORD_EVENT_TYPE } from '../../../fee-record/event/fee-record.event-type';

jest.mock('../helpers');

describe('handleUtilisationReportRemoveFeesFromPaymentGroupEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: REQUEST_PLATFORM_TYPE.TFM,
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const aReconciliationInProgressReport = () => UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

  const aFeeRecordForReport = (report: UtilisationReportEntity, id: number) => FeeRecordEntityMockBuilder.forReport(report).withId(id).build();

  const aMockEventHandler = () => jest.fn();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  const createFeeRecordsAndMocks = (utilisationReport: UtilisationReportEntity, feeRecordIds: number[]) => {
    const feeRecords = feeRecordIds.map((id) => aFeeRecordForReport(utilisationReport, id));
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    return { feeRecords, eventHandlers, feeRecordStateMachines };
  };

  beforeEach(() => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls the fee record state machine event handler for selected fee records', async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();

    const feeRecordIds = [1, 2, 3, 4];
    const { feeRecords, eventHandlers, feeRecordStateMachines } = createFeeRecordsAndMocks(utilisationReport, feeRecordIds);

    const expectedFeeRecordsToRemove = feeRecords.slice(0, 2);
    const expectedOtherFeeRecordsInGroup = feeRecords.slice(2);
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    // Act
    await handleUtilisationReportRemoveFeesFromPaymentGroupEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsToRemove: expectedFeeRecordsToRemove,
      otherFeeRecordsInGroup: expectedOtherFeeRecordsInGroup,
      requestSource,
    });

    // Assert
    expectedFeeRecordsToRemove.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'REMOVE_FROM_PAYMENT_GROUP',
        payload: {
          transactionEntityManager: mockEntityManager,
          requestSource,
        },
      });
    });
  });

  it.each([
    { feeRecordsAndPaymentsMatch: true, testNameSuffix: 'the fee records match the payments' },
    { feeRecordsAndPaymentsMatch: false, testNameSuffix: 'the fee records do not match the payments' },
  ])(
    "calls the fee record state machine event handlers for unselected fee records with 'feeRecordsAndPaymentsMatch' set to '$feeRecordsAndPaymentsMatch' if $testNameSuffix",
    async ({ feeRecordsAndPaymentsMatch }) => {
      // Arrange
      const utilisationReport = aReconciliationInProgressReport();

      const feeRecordIds = [1, 2, 3, 4];
      const { feeRecords, eventHandlers, feeRecordStateMachines } = createFeeRecordsAndMocks(utilisationReport, feeRecordIds);

      const expectedFeeRecordsToRemove = feeRecords.slice(0, 2);
      const expectedOtherFeeRecordsInGroup = feeRecords.slice(2);

      jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

      jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(feeRecordsAndPaymentsMatch);

      // Act
      await handleUtilisationReportRemoveFeesFromPaymentGroupEvent(utilisationReport, {
        transactionEntityManager: mockEntityManager,
        feeRecordsToRemove: expectedFeeRecordsToRemove,
        otherFeeRecordsInGroup: expectedOtherFeeRecordsInGroup,
        requestSource,
      });

      // Assert
      expectedOtherFeeRecordsInGroup.forEach(({ id }) => {
        const eventHandler = eventHandlers[id];
        expect(eventHandler).toHaveBeenCalledWith({
          type: FEE_RECORD_EVENT_TYPE.OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP,
          payload: {
            transactionEntityManager: mockEntityManager,
            feeRecordsAndPaymentsMatch,
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
    await handleUtilisationReportRemoveFeesFromPaymentGroupEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsToRemove: [],
      otherFeeRecordsInGroup: [],
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
    expect(utilisationReport.lastUpdatedByIsSystemUser).toEqual(false);
    expect(utilisationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(utilisationReport.lastUpdatedByTfmUserId).toEqual(tfmUserId);
  });
});
