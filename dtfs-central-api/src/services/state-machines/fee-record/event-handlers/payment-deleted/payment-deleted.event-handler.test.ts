import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleFeeRecordPaymentDeletedEvent } from './payment-deleted.event-handler';

describe('handleFeeRecordPaymentDeletedEvent', () => {
  const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  it.each([true, false])(
    "sets the fee record status to match when the event payload 'feeRecordsAndPaymentsMatch' is true and 'hasAttachedPayments' is %s",
    async (hasAttachedPayments: boolean) => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('DOES_NOT_MATCH').build();

      // Act
      await handleFeeRecordPaymentDeletedEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        feeRecordsAndPaymentsMatch: true,
        hasAttachedPayments,
        requestSource: aRequestSource(),
      });

      // Assert
      expect(feeRecord.status).toBe('MATCH');
    },
  );

  it("sets the fee record status to does not match when the event payload 'feeRecordsAndPaymentsMatch' is false and 'hasAttachedPayments' is true", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('MATCH').build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: false,
      hasAttachedPayments: true,
      requestSource: aRequestSource(),
    });

    // Assert
    expect(feeRecord.status).toBe('DOES_NOT_MATCH');
  });

  it("sets the fee record status to to do when the event payload 'feeRecordsAndPaymentsMatch' is false and 'hasAttachedPayments' is false", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('MATCH').build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: false,
      hasAttachedPayments: false,
      requestSource: aRequestSource(),
    });

    // Assert
    expect(feeRecord.status).toBe('TO_DO');
  });

  it('updates the last updated by fields to the request source', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT)
      .withStatus('TO_DO')
      .withLastUpdatedByIsSystemUser(true)
      .withLastUpdatedByPortalUserId(null)
      .withLastUpdatedByTfmUserId(null)
      .build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      hasAttachedPayments: false,
      requestSource: {
        platform: 'TFM',
        userId: '123',
      },
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toBe('123');
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });

  function aRequestSource(): DbRequestSource {
    return {
      platform: 'TFM',
      userId: '123',
    };
  }
});
