import { EntityManager } from 'typeorm';
import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleFeeRecordPaymentDeletedEvent } from './payment-deleted.event-handler';
import { aDbRequestSource } from '../../../../../../test-helpers';

describe('handleFeeRecordPaymentDeletedEvent', () => {
  const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  it("sets the fee record status to 'MATCH' when the event payload 'feeRecordsAndPaymentsMatch' is true and 'hasAttachedPayments' is true", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('DOES_NOT_MATCH').build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      hasAttachedPayments: true,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(feeRecord.status).toEqual('MATCH');
  });

  it("sets the fee record status to 'DOES_NOT_MATCH' when the event payload 'feeRecordsAndPaymentsMatch' is false and 'hasAttachedPayments' is true", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('MATCH').build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: false,
      hasAttachedPayments: true,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(feeRecord.status).toEqual('DOES_NOT_MATCH');
  });

  it("sets the fee record status to 'TO_DO' when the event payload 'feeRecordsAndPaymentsMatch' is false and 'hasAttachedPayments' is false", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('MATCH').build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: false,
      hasAttachedPayments: false,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(feeRecord.status).toEqual('TO_DO');
  });

  it("throws an error when the event payload 'feeRecordsAndPaymentsMatch' is true and 'hasAttachedPayments' is false", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus('MATCH').build();

    // Act / Assert
    await expect(
      handleFeeRecordPaymentDeletedEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        feeRecordsAndPaymentsMatch: true,
        hasAttachedPayments: false,
        requestSource: aDbRequestSource(),
      }),
    ).rejects.toThrow(new Error('Fee records and payments cannot match when there are no attached payments'));
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
      feeRecordsAndPaymentsMatch: false,
      hasAttachedPayments: false,
      requestSource: {
        platform: 'TFM',
        userId: '123',
      },
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual('123');
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });
});
