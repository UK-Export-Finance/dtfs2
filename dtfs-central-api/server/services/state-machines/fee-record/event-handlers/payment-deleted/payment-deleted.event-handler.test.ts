import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { EntityManager } from 'typeorm';
import { FEE_RECORD_STATUS, PENDING_RECONCILIATION, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { handleFeeRecordPaymentDeletedEvent } from './payment-deleted.event-handler';
import { aDbRequestSource } from '../../../../../../test-helpers';

describe('handleFeeRecordPaymentDeletedEvent', () => {
  const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  describe("when 'hasAttachedPayments' is true", () => {
    const hasAttachedPayments = true;

    describe.each([true, false])("when 'hasCorrections' is %s", (hasCorrections) => {
      it(`should set the fee record status to ${FEE_RECORD_STATUS.MATCH} when the event payload 'feeRecordsAndPaymentsMatch' is true`, async () => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build();

        // Act
        await handleFeeRecordPaymentDeletedEvent(feeRecord, {
          transactionEntityManager: mockEntityManager,
          feeRecordsAndPaymentsMatch: true,
          hasAttachedPayments,
          hasCorrections,
          requestSource: aDbRequestSource(),
        });

        // Assert
        expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.MATCH);
      });

      it(`should set the fee record status to ${FEE_RECORD_STATUS.DOES_NOT_MATCH} when the event payload 'feeRecordsAndPaymentsMatch' is false`, async () => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.MATCH).build();

        // Act
        await handleFeeRecordPaymentDeletedEvent(feeRecord, {
          transactionEntityManager: mockEntityManager,
          feeRecordsAndPaymentsMatch: false,
          hasAttachedPayments,
          hasCorrections,
          requestSource: aDbRequestSource(),
        });

        // Assert
        expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.DOES_NOT_MATCH);
      });
    });
  });

  describe("when 'hasAttachedPayments' is false", () => {
    const hasAttachedPayments = false;

    describe.each([true, false])("when 'feeRecordsAndPaymentsMatch' is %s", (feeRecordsAndPaymentsMatch) => {
      it(`should set the fee record status to ${FEE_RECORD_STATUS.TO_DO} when the event payload 'hasCorrections' is false`, async () => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.MATCH).build();

        // Act
        await handleFeeRecordPaymentDeletedEvent(feeRecord, {
          transactionEntityManager: mockEntityManager,
          feeRecordsAndPaymentsMatch,
          hasAttachedPayments,
          hasCorrections: false,
          requestSource: aDbRequestSource(),
        });

        // Assert
        expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO);
      });

      it(`should set the fee record status to ${FEE_RECORD_STATUS.TO_DO_AMENDED} when the event payload 'hasCorrections' is true`, async () => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT).withStatus(FEE_RECORD_STATUS.MATCH).build();

        // Act
        await handleFeeRecordPaymentDeletedEvent(feeRecord, {
          transactionEntityManager: mockEntityManager,
          feeRecordsAndPaymentsMatch,
          hasAttachedPayments,
          hasCorrections: true,
          requestSource: aDbRequestSource(),
        });

        // Assert
        expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO_AMENDED);
      });
    });
  });

  it('updates the last updated by fields to the request source', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(PENDING_RECONCILIATION_REPORT)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .withLastUpdatedByIsSystemUser(true)
      .withLastUpdatedByPortalUserId(null)
      .withLastUpdatedByTfmUserId(null)
      .build();

    // Act
    await handleFeeRecordPaymentDeletedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: false,
      hasAttachedPayments: false,
      hasCorrections: false,
      requestSource: {
        platform: REQUEST_PLATFORM_TYPE.TFM,
        userId: '123',
      },
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual('123');
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });
});
