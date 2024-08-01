import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FacilityUtilisationDataEntityMockBuilder,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  ReportPeriod,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleFeeRecordGenerateKeyingDataEvent } from './generate-keying-data.event-handler';
import { aReportPeriod } from '../../../../../../test-helpers/test-data';
import { calculateFixedFeeAdjustment } from '../helpers';

jest.mock<unknown>('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  calculateFixedFeeAdjustment: jest.fn(),
}));

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

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(calculateFixedFeeAdjustment).mockResolvedValue(10);
  });

  it('saves the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = aMatchingFeeRecord();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      isFinalFeeRecordForFacility: true,
      reportPeriod: aReportPeriod(),
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
      reportPeriod: aReportPeriod(),
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
      reportPeriod: aReportPeriod(),
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
      reportPeriod: aReportPeriod(),
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
      reportPeriod: aReportPeriod(),
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByTfmUserId).toBe(userId);
  });

  describe('when isFinalFeeRecordForFacility is set to true', () => {
    const isFinalFeeRecordForFacility = true;

    it('sets the fee record fixedFeeAdjustment to fixed fee adjustment', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();
      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };

      jest.mocked(calculateFixedFeeAdjustment).mockResolvedValue(999.99);

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod,
        requestSource,
      });

      // Assert
      expect(feeRecord.fixedFeeAdjustment).toBe(999.99);
      expect(calculateFixedFeeAdjustment).toHaveBeenCalledWith(feeRecord, feeRecord.facilityUtilisationData, reportPeriod);
    });

    it('sets the fee record premiumAccrualBalanceAdjustment to 10', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
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
        reportPeriod: aReportPeriod(),
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
        reportPeriod: aReportPeriod(),
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
        reportPeriod: aReportPeriod(),
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
        reportPeriod: aReportPeriod(),
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
