import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FacilityUtilisationDataEntityMockBuilder,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleFeeRecordGenerateKeyingDataEvent } from './generate-keying-data.event-handler';

describe('handleFeeRecordGenerateKeyingDataEvent', () => {
  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const userId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId,
  };

  const aMatchingFeeRecord = () => FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withStatus('MATCH').build();

  it('saves the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = aMatchingFeeRecord();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      isFinalFeeRecordForFacility: true,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });

  it(`updates the fee record status to '${FEE_RECORD_STATUS.READY_TO_KEY}'`, async () => {
    // Arrange
    const feeRecord = aMatchingFeeRecord();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      isFinalFeeRecordForFacility: true,
      requestSource,
    });

    // Assert
    expect(feeRecord.status).toBe(FEE_RECORD_STATUS.READY_TO_KEY);
  });

  it("sets the fee record 'lastUpdatedByIsSystemUser' field to false", async () => {
    // Arrange
    const feeRecord = aMatchingFeeRecord();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      isFinalFeeRecordForFacility: true,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
  });

  it("sets the fee record 'lastUpdatedByPortalUserId' to null", async () => {
    // Arrange
    const feeRecord = aMatchingFeeRecord();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      isFinalFeeRecordForFacility: true,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });

  it("sets the fee record 'lastUpdatedByTfmUserId' to the request source user id", async () => {
    // Arrange
    const feeRecord = aMatchingFeeRecord();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      isFinalFeeRecordForFacility: true,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByTfmUserId).toBe(userId);
  });

  describe('when isFinalFeeRecordForFacility is set to true', () => {
    const isFinalFeeRecordForFacility = true;

    it('sets the fee record fixedFeeAdjustment to 10', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        requestSource,
      });

      // Assert
      expect(feeRecord.fixedFeeAdjustment).toBe(10);
    });

    it('sets the fee record premiumAccrualBalanceAdjustment to 10', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        requestSource,
      });

      // Assert
      expect(feeRecord.premiumAccrualBalanceAdjustment).toBe(10);
    });

    it('sets the fee record principalBalanceAdjustment to the difference between the fee record utilisation and the facility utilisation data utilisation', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();
      feeRecord.facilityUtilisation = 3000;
      feeRecord.facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId(feeRecord.facilityId).withUtilisation(2000).build();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        requestSource,
      });

      // Assert
      expect(feeRecord.principalBalanceAdjustment).toBe(1000);
    });
  });

  describe('when isFinalFeeRecordForFacility is set to false', () => {
    const isFinalFeeRecordForFacility = false;

    it('does not set the fee record fixedFeeAdjustment', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        requestSource,
      });

      // Assert
      expect(feeRecord.fixedFeeAdjustment).toBeNull();
    });

    it('does not set the fee record premiumAccrualBalanceAdjustment', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        requestSource,
      });

      // Assert
      expect(feeRecord.premiumAccrualBalanceAdjustment).toBeNull();
    });

    it('does not set the fee record principalBalanceAdjustment', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        requestSource,
      });

      // Assert
      expect(feeRecord.principalBalanceAdjustment).toBeNull();
    });
  });

  function aReconciliationInProgressReport() {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});
