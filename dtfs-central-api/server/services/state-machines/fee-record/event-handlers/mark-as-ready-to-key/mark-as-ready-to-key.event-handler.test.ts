import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  REQUEST_PLATFORM_TYPE,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleFeeRecordMarkAsReadyToKeyEvent } from './mark-as-ready-to-key.event-handler';

describe('handleFeeRecordMarkAsReadyToKeyEvent', () => {
  const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

  const reconciledFeeRecordBuilder = () =>
    FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT)
      .withStatus(FEE_RECORD_STATUS.RECONCILED)
      .withReconciledByUserId('abc123')
      .withDateReconciled(new Date('2024'));

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const userId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: REQUEST_PLATFORM_TYPE.TFM,
    userId,
  };

  it('saves the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = reconciledFeeRecordBuilder().build();

    // Act
    await handleFeeRecordMarkAsReadyToKeyEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });

  it('sets the fee record status to READY_TO_KEY', async () => {
    // Arrange
    const feeRecord = reconciledFeeRecordBuilder().build();

    // Act
    await handleFeeRecordMarkAsReadyToKeyEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
  });

  it('sets the dateReconciled and reconciledByUserId to null', async () => {
    // Arrange
    const feeRecord = reconciledFeeRecordBuilder().build();

    // Act
    await handleFeeRecordMarkAsReadyToKeyEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(feeRecord.dateReconciled).toBeNull();
    expect(feeRecord.reconciledByUserId).toBeNull();
  });

  it('updates the last updated by user fields using the db request source', async () => {
    // Arrange
    const feeRecord = reconciledFeeRecordBuilder()
      .withLastUpdatedByIsSystemUser(true)
      .withLastUpdatedByPortalUserId('123')
      .withLastUpdatedByTfmUserId(null)
      .build();

    // Act
    await handleFeeRecordMarkAsReadyToKeyEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });
});
