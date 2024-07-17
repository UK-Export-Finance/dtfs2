import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordEntityMockBuilder, FeeRecordStatus, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
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

  it('saves the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('READY_TO_KEY').build();

    // Act
    await handleFeeRecordMarkAsReconciledEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
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
      requestSource,
    });

    // Assert
    expect(feeRecord.status).toBe<FeeRecordStatus>('RECONCILED');
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
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toBe(userId);
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });
});
