import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleFeeRecordPaymentEditedEvent } from './payment-edited.event-handler';

describe('handleFeeRecordPaymentEditedEvent', () => {
  const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

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
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.TO_DO).build();

    // Act
    await handleFeeRecordPaymentEditedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });

  it.each([
    { feeRecordsAndPaymentsMatch: true, expectedStatus: FEE_RECORD_STATUS.MATCH },
    { feeRecordsAndPaymentsMatch: false, expectedStatus: FEE_RECORD_STATUS.DOES_NOT_MATCH },
  ])(
    "sets the fee record status to '$expectedStatus' when the event payload 'feeRecordsAndPaymentsMatch' is '$feeRecordsAndPaymentsMatch'",
    async ({ feeRecordsAndPaymentsMatch, expectedStatus }) => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.TO_DO).build();

      // Act
      await handleFeeRecordPaymentEditedEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        feeRecordsAndPaymentsMatch,
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(expectedStatus);
    },
  );

  it("sets the fee record 'lastUpdatedByIsSystemUser' field to false", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.TO_DO).build();

    // Act
    await handleFeeRecordPaymentEditedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
  });

  it("sets the fee record 'lastUpdatedByPortalUserId' to null", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.TO_DO).build();

    // Act
    await handleFeeRecordPaymentEditedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });

  it("sets the fee record 'lastUpdatedByTfmUserId' to the request source user id", async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.TO_DO).build();

    // Act
    await handleFeeRecordPaymentEditedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
  });
});
