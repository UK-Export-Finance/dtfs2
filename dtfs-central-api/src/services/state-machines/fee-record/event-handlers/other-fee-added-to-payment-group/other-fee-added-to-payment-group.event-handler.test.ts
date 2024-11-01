import { EntityManager } from 'typeorm';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  REQUEST_PLATFORM_TYPE,
  UTILISATION_REPORT_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent } from './other-fee-added-to-payment-group.event-handler';
import { aDbRequestSource } from '../../../../../../test-helpers/test-data/db-request-source';

describe('handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent', () => {
  const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS).build();

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  it.each([
    { feeRecordsAndPaymentsMatch: true, expectedStatus: FEE_RECORD_STATUS.MATCH },
    { feeRecordsAndPaymentsMatch: false, expectedStatus: FEE_RECORD_STATUS.DOES_NOT_MATCH },
  ])(
    "sets the fee record status to '$expectedStatus' when the event payload 'feeRecordsAndPaymentsMatch' is '$feeRecordsAndPaymentsMatch'",
    async ({ feeRecordsAndPaymentsMatch, expectedStatus }) => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).build();

      // Act
      await handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        feeRecordsAndPaymentsMatch,
        requestSource: aDbRequestSource(),
      });

      // Assert
      expect(feeRecord.status).toEqual(expectedStatus);
    },
  );

  it('updates the last updated by fields to the request source', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT)
      .withStatus(FEE_RECORD_STATUS.MATCH)
      .withLastUpdatedByIsSystemUser(true)
      .withLastUpdatedByPortalUserId(null)
      .withLastUpdatedByTfmUserId(null)
      .build();
    const userId = '123';

    // Act
    await handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      requestSource: {
        platform: REQUEST_PLATFORM_TYPE.TFM,
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
    await handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAndPaymentsMatch: true,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });
});
