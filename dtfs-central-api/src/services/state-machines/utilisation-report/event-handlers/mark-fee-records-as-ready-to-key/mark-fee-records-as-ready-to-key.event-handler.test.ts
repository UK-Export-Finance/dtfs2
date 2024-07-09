import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntityMockBuilder, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent } from './mark-fee-records-as-ready-to-key.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

describe('handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockFind = jest.fn();
  const mockEntityManager = {
    save: mockSave,
    find: mockFind,
  } as unknown as EntityManager;

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

  it('calls the fee record state machine with the MARK_AS_READY_TO_KEY event for every fee record to reconcile', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('RECONCILED').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('RECONCILED').build();
    const feeRecordThree = FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus('RECONCILED').build();
    report.feeRecords = [feeRecordOne, feeRecordTwo, feeRecordThree];

    const eventHandlerOne = aMockEventHandler();
    const eventHandlerTwo = aMockEventHandler();
    const feeRecordStateMachineOne = aMockFeeRecordStateMachine(eventHandlerOne);
    const feeRecordStateMachineTwo = aMockFeeRecordStateMachine(eventHandlerTwo);

    const feeRecordStateMachineConstructorSpy = jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => {
      if (feeRecord.id === 1) {
        return feeRecordStateMachineOne;
      }
      if (feeRecord.id === 2) {
        return feeRecordStateMachineTwo;
      }
      return aMockFeeRecordStateMachine(aMockEventHandler());
    });

    // Act
    await handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent(report, {
      requestSource,
      feeRecordsToMarkAsReadyToKey: [feeRecordOne, feeRecordTwo],
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(feeRecordStateMachineConstructorSpy).toHaveBeenCalledTimes(2);
    expect(eventHandlerOne).toHaveBeenCalledTimes(1);
    expect(eventHandlerOne).toHaveBeenCalledWith({
      type: 'MARK_AS_READY_TO_KEY',
      payload: {
        transactionEntityManager: mockEntityManager,
        requestSource,
      },
    });
    expect(eventHandlerTwo).toHaveBeenCalledTimes(1);
    expect(eventHandlerTwo).toHaveBeenCalledWith({
      type: 'MARK_AS_READY_TO_KEY',
      payload: {
        transactionEntityManager: mockEntityManager,
        requestSource,
      },
    });
  });

  it('updates the report status to RECONCILIATION_IN_PROGRESS if report status is RECONCILIATION_COMPLETED', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('RECONCILED').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('RECONCILED').build();
    const feeRecordThree = FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus('RECONCILED').build();
    report.feeRecords = [feeRecordOne, feeRecordTwo, feeRecordThree];

    // Act
    await handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent(report, {
      requestSource,
      feeRecordsToMarkAsReadyToKey: [feeRecordOne, feeRecordTwo],
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
    expect(report).toEqual(
      expect.objectContaining<Partial<UtilisationReportEntity>>({
        status: 'RECONCILIATION_IN_PROGRESS',
        lastUpdatedByTfmUserId: requestSource.userId,
        lastUpdatedByPortalUserId: null,
        lastUpdatedByIsSystemUser: false,
      }),
    );
  });

  it('does not update the report status if the status is already RECONCILIATION_IN_PROGRESS', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('RECONCILED').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('RECONCILED').build();
    const feeRecordThree = FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus('RECONCILED').build();
    report.feeRecords = [feeRecordOne, feeRecordTwo, feeRecordThree];

    // Act
    await handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent(report, {
      requestSource,
      feeRecordsToMarkAsReadyToKey: [feeRecordOne, feeRecordTwo],
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockSave).not.toHaveBeenCalled();
    expect(report).toEqual(
      expect.objectContaining<Partial<UtilisationReportEntity>>({
        status: 'RECONCILIATION_IN_PROGRESS',
      }),
    );
  });
});
