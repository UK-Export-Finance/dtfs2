import { EntityManager } from 'typeorm';
import { FeeRecordEntity, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleFeeRecordRemoveFromPaymentGroupEvent } from './remove-from-payment-group.event-handler';
import { aDbRequestSource } from '../../../../../../test-helpers';

describe('handleFeeRecordRemoveFromPaymentGroupEvent', () => {
  const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  it('removes all payments from the fee record', async () => {
    // Arrange
    const payments = [
      PaymentEntityMockBuilder.forCurrency('GBP').withId(1).build(),
      PaymentEntityMockBuilder.forCurrency('GBP').withId(2).build(),
      PaymentEntityMockBuilder.forCurrency('GBP').withId(3).build(),
    ];
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withPayments(payments).build();

    // Act
    await handleFeeRecordRemoveFromPaymentGroupEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(feeRecord.payments).toHaveLength(0);
  });

  it("sets the fee record status to 'TO_DO'", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('MATCH').build();

    // Act
    await handleFeeRecordRemoveFromPaymentGroupEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(feeRecord.status).toEqual('TO_DO');
  });

  it('updates the last updated by fields to the request source', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT)
      .withStatus('MATCH')
      .withLastUpdatedByIsSystemUser(true)
      .withLastUpdatedByPortalUserId(null)
      .withLastUpdatedByTfmUserId(null)
      .build();
    const userId = '123';

    // Act
    await handleFeeRecordRemoveFromPaymentGroupEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource: {
        platform: 'TFM',
        userId,
      },
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });

  it('saves the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).build();

    // Act
    await handleFeeRecordRemoveFromPaymentGroupEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });
});
