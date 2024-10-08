import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleFeeRecordMarkAsReconciledEvent } from './mark-as-reconciled.event-handler';

describe('handleFeeRecordMarkAsReconciledEvent', () => {
  const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const userId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId,
  };

  const mockDate = new Date();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('saves the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('READY_TO_KEY').build();

    // Act
    await handleFeeRecordMarkAsReconciledEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      reconciledByUserId: 'abc123',
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });

  it('sets the fee record status to RECONCILED', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('READY_TO_KEY').build();

    // Act
    await handleFeeRecordMarkAsReconciledEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      reconciledByUserId: 'abc123',
      requestSource,
    });

    // Assert
    expect(feeRecord.status).toEqual<FeeRecordStatus>('RECONCILED');
  });

  it('sets the dateReconciled to the current date and reconciledByUserId field to the supplied value', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT)
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withDateReconciled(null)
      .withReconciledByUserId(null)
      .build();

    // Act
    await handleFeeRecordMarkAsReconciledEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      reconciledByUserId: 'abc123',
      requestSource,
    });

    // Assert
    expect(feeRecord.reconciledByUserId).toEqual('abc123');
    expect(feeRecord.dateReconciled).toEqual(mockDate);
  });

  it('updates the last updated by user fields using the db request source', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT)
      .withStatus('READY_TO_KEY')
      .withLastUpdatedByIsSystemUser(true)
      .withLastUpdatedByPortalUserId('123')
      .withLastUpdatedByTfmUserId(null)
      .build();

    // Act
    await handleFeeRecordMarkAsReconciledEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      reconciledByUserId: 'abc123',
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });
});
