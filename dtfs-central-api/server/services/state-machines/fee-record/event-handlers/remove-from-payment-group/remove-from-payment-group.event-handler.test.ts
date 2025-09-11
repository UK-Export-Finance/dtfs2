import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { EntityManager } from 'typeorm';
import { CURRENCY, FEE_RECORD_STATUS, FeeRecordEntity, REQUEST_PLATFORM_TYPE, RECONCILIATION_IN_PROGRESS, FeeRecordCorrectionEntity } from '@ukef/dtfs2-common';
import { handleFeeRecordRemoveFromPaymentGroupEvent } from './remove-from-payment-group.event-handler';
import { aDbRequestSource } from '../../../../../../test-helpers';

describe('handleFeeRecordRemoveFromPaymentGroupEvent', () => {
  const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

  const mockSave = jest.fn();
  const mockExistsBy = jest.fn();

  const mockEntityManager = {
    save: mockSave,
    existsBy: mockExistsBy,
  } as unknown as EntityManager;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('removes all payments from the fee record', async () => {
    // Arrange
    const payments = [
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(1).build(),
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(2).build(),
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(3).build(),
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

  describe('when the fee record has no corrections', () => {
    beforeEach(() => {
      mockExistsBy.mockReturnValue(false);
    });

    it(`should set the fee record status to ${FEE_RECORD_STATUS.TO_DO}`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus(FEE_RECORD_STATUS.MATCH).build();

      // Act
      await handleFeeRecordRemoveFromPaymentGroupEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        requestSource: aDbRequestSource(),
      });

      // Assert
      expect(mockExistsBy).toHaveBeenCalledTimes(1);
      expect(mockExistsBy).toHaveBeenCalledWith(FeeRecordCorrectionEntity, { feeRecord: { id: feeRecord.id } });

      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO);
    });
  });

  describe('when the fee record has corrections', () => {
    beforeEach(() => {
      mockExistsBy.mockReturnValue(true);
    });

    it(`should set the fee record status to ${FEE_RECORD_STATUS.TO_DO_AMENDED}`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus(FEE_RECORD_STATUS.MATCH).build();

      // Act
      await handleFeeRecordRemoveFromPaymentGroupEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        requestSource: aDbRequestSource(),
      });

      // Assert
      expect(mockExistsBy).toHaveBeenCalledTimes(1);
      expect(mockExistsBy).toHaveBeenCalledWith(FeeRecordCorrectionEntity, { feeRecord: { id: feeRecord.id } });

      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO_AMENDED);
    });
  });

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
    await handleFeeRecordRemoveFromPaymentGroupEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
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
    await handleFeeRecordRemoveFromPaymentGroupEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });
});
