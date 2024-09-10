import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntityMockBuilder, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportMarkFeeRecordsAsReconciledEvent } from './mark-fee-records-as-reconciled.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

describe('handleUtilisationReportMarkFeeRecordsAsReconciledEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockFindOneOrFail = jest.fn();
  const mockEntityManager = {
    save: mockSave,
    findOneOrFail: mockFindOneOrFail,
  } as unknown as EntityManager;

  const aMockEventHandler = () => jest.fn().mockImplementation();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  beforeEach(() => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
    mockFindOneOrFail.mockResolvedValue(UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withFeeRecords([]).build());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls the fee record state machine with the MARK_AS_RECONCILED event for every fee record to reconcile', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('READY_TO_KEY').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('READY_TO_KEY').build();

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
    await handleUtilisationReportMarkFeeRecordsAsReconciledEvent(report, {
      requestSource,
      feeRecordsToReconcile: [feeRecordOne, feeRecordTwo],
      transactionEntityManager: mockEntityManager,
      reconciledByUserId: 'abc123',
    });

    // Assert
    expect(feeRecordStateMachineConstructorSpy).toHaveBeenCalledTimes(2);
    expect(eventHandlerOne).toHaveBeenCalledTimes(1);
    expect(eventHandlerOne).toHaveBeenCalledWith({
      type: 'MARK_AS_RECONCILED',
      payload: {
        transactionEntityManager: mockEntityManager,
        reconciledByUserId: 'abc123',
        requestSource,
      },
    });
    expect(eventHandlerTwo).toHaveBeenCalledTimes(1);
    expect(eventHandlerTwo).toHaveBeenCalledWith({
      type: 'MARK_AS_RECONCILED',
      payload: {
        transactionEntityManager: mockEntityManager,
        reconciledByUserId: 'abc123',
        requestSource,
      },
    });
  });

  it('sets report status to RECONCILED if all fee records are now reconciled', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('READY_TO_KEY').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('READY_TO_KEY').build();

    const reportWithUpdatedFeeRecords = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOneUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('RECONCILED').build();
    const feeRecordTwoUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('RECONCILED').build();
    const feeRecordThreeUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus('RECONCILED').build();
    reportWithUpdatedFeeRecords.feeRecords = [feeRecordOneUpdated, feeRecordTwoUpdated, feeRecordThreeUpdated];
    mockFindOneOrFail.mockResolvedValue(reportWithUpdatedFeeRecords);

    // Act
    await handleUtilisationReportMarkFeeRecordsAsReconciledEvent(report, {
      requestSource,
      feeRecordsToReconcile: [feeRecordOne, feeRecordTwo],
      transactionEntityManager: mockEntityManager,
      reconciledByUserId: 'abc123',
    });

    // Assert
    expect(mockFindOneOrFail).toHaveBeenCalledWith(UtilisationReportEntity, { where: { id: report.id }, relations: { feeRecords: true } });
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
    expect(report).toEqual(
      expect.objectContaining<Partial<UtilisationReportEntity>>({
        status: 'RECONCILIATION_COMPLETED',
        lastUpdatedByTfmUserId: requestSource.userId,
        lastUpdatedByPortalUserId: null,
        lastUpdatedByIsSystemUser: false,
      }),
    );
  });

  it('does not set report status to RECONCILED if not all fee records are now reconciled', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('READY_TO_KEY').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('READY_TO_KEY').build();

    const reportWithUpdatedFeeRecords = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOneUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('RECONCILED').build();
    const feeRecordTwoUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('RECONCILED').build();
    const feeRecordThreeUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus('READY_TO_KEY').build();
    reportWithUpdatedFeeRecords.feeRecords = [feeRecordOneUpdated, feeRecordTwoUpdated, feeRecordThreeUpdated];
    mockFindOneOrFail.mockResolvedValue(reportWithUpdatedFeeRecords);

    // Act
    await handleUtilisationReportMarkFeeRecordsAsReconciledEvent(report, {
      requestSource,
      feeRecordsToReconcile: [feeRecordOne, feeRecordTwo],
      transactionEntityManager: mockEntityManager,
      reconciledByUserId: 'abc123',
    });

    // Assert
    expect(mockFindOneOrFail).toHaveBeenCalledWith(UtilisationReportEntity, { where: { id: report.id }, relations: { feeRecords: true } });
    expect(mockSave).not.toHaveBeenCalled();
    expect(report).toEqual(
      expect.objectContaining<Partial<UtilisationReportEntity>>({
        status: 'RECONCILIATION_IN_PROGRESS',
      }),
    );
  });
});
