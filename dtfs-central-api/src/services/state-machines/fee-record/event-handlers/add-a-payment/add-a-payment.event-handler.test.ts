import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleFeeRecordAddAPaymentEvent } from './add-a-payment.event-handler';

describe('handleFeeRecordAddAPaymentEvent', () => {
  const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  const mockEntityManager = {
    save: jest.fn(),
  } as unknown as EntityManager;

  const userId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId,
  };

  it('saves the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('TO_DO').build();

    // Act
    await handleFeeRecordAddAPaymentEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      status: 'MATCH',
      requestSource,
    });

    // Assert
    expect(mockEntityManager.save).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });

  it.each(['MATCH', 'DOES_NOT_MATCH'] as const)("sets the fee record status to '%s' when the event payload status is '%s'", async (status) => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('TO_DO').build();

    // Act
    await handleFeeRecordAddAPaymentEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      status,
      requestSource,
    });

    // Assert
    expect(feeRecord.status).toBe(status);
  });

  it("sets the fee record 'lastUpdatedByIsSystemUser' field to false", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('TO_DO').build();

    // Act
    await handleFeeRecordAddAPaymentEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      status: 'MATCH',
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
  });

  it("sets the fee record 'lastUpdatedByPortalUserId' to null", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('TO_DO').build();

    // Act
    await handleFeeRecordAddAPaymentEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      status: 'MATCH',
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });

  it("sets the fee record 'lastUpdatedByTfmUserId' to the request source user id", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('TO_DO').build();

    // Act
    await handleFeeRecordAddAPaymentEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      status: 'MATCH',
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByTfmUserId).toBe(userId);
  });
});
