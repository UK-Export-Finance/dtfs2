import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FacilityUtilisationDataEntityMockBuilder,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  ReportPeriod,
  REQUEST_PLATFORM_TYPE,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleFeeRecordGenerateKeyingDataEvent } from './generate-keying-data.event-handler';
import { aReportPeriod, keyingSheetCalculationFacilityValues } from '../../../../../../test-helpers';
import { calculateFixedFeeAdjustment, calculatePrincipalBalanceAdjustment, updateFacilityUtilisationData, calculateFixedFee } from '../helpers';
import { calculateUkefShareOfUtilisation, getKeyingSheetCalculationFacilityValues } from '../../../../../helpers';

jest.mock<unknown>('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  calculateFixedFeeAdjustment: jest.fn(),
  calculatePrincipalBalanceAdjustment: jest.fn(),
  updateFacilityUtilisationData: jest.fn(),
}));

jest.mock('../../../../../helpers/get-keying-sheet-calculation-facility-values');
jest.mock('../../../../../helpers/calculate-ukef-share-of-utilisation');

describe('handleFeeRecordGenerateKeyingDataEvent', () => {
  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const userId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: REQUEST_PLATFORM_TYPE.TFM,
    userId,
  };

  const aMatchingFeeRecord = () => FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withStatus(FEE_RECORD_STATUS.MATCH).build();

  beforeEach(() => {
    jest.mocked(calculateFixedFeeAdjustment).mockReturnValue(10);
    jest.mocked(calculatePrincipalBalanceAdjustment).mockReturnValue(20);
    jest.mocked(updateFacilityUtilisationData).mockResolvedValue(aFacilityUtilisationDataEntity());
    jest.mocked(getKeyingSheetCalculationFacilityValues).mockResolvedValue(keyingSheetCalculationFacilityValues);
    jest.mocked(calculateUkefShareOfUtilisation).mockReturnValue(99999999);
  });

  afterEach(() => {
    jest.resetAllMocks();
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

      const ukefShareOfUtilisation = 1500;
      jest.mocked(calculateFixedFeeAdjustment).mockReturnValue(999.99);
      jest.mocked(calculateUkefShareOfUtilisation).mockReturnValue(1500);

      const { coverEndDate, interestPercentage, dayCountBasis } = keyingSheetCalculationFacilityValues;
      const fixedFee = calculateFixedFee({
        ukefShareOfUtilisation,
        reportPeriod,
        coverEndDate,
        interestPercentage,
        dayCountBasis,
      });

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod,
        requestSource,
      });

      // Assert
      expect(feeRecord.fixedFeeAdjustment).toEqual(999.99);
      expect(calculateFixedFeeAdjustment).toHaveBeenCalledWith(feeRecord, feeRecord.facilityUtilisationData, reportPeriod, fixedFee);
    });

    it('sets the fee record principalBalanceAdjustment to principal balance adjustment', async () => {
      // Arrange
      const feeRecord = aMatchingFeeRecord();
      feeRecord.facilityUtilisation = 1300;
      const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId(feeRecord.facilityId).withUtilisation(2000).build();
      feeRecord.facilityUtilisationData = facilityUtilisationData;

      jest.mocked(calculateUkefShareOfUtilisation).mockReturnValue(1500);
      jest.mocked(calculatePrincipalBalanceAdjustment).mockReturnValue(200);

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.principalBalanceAdjustment).toEqual(200);
      expect(calculatePrincipalBalanceAdjustment).toHaveBeenCalledWith(1500, facilityUtilisationData);
    });

    it('saves the updated fee record with the supplied entity manager', async () => {
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
      expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
    });

    it(`updates the fee record status to '${FEE_RECORD_STATUS.READY_TO_KEY}' if the fees paid to ukef is non zero`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(0.01)
        .build();
      jest.mocked(calculatePrincipalBalanceAdjustment).mockReturnValue(0);
      jest.mocked(calculateFixedFeeAdjustment).mockReturnValue(0);

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
    });

    it(`updates the fee record status to '${FEE_RECORD_STATUS.READY_TO_KEY}' if the fixed fee adjustment is greater than zero`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(0)
        .build();
      jest.mocked(calculatePrincipalBalanceAdjustment).mockReturnValue(0);
      jest.mocked(calculateFixedFeeAdjustment).mockReturnValue(0.01);

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
    });

    it(`updates the fee record status to '${FEE_RECORD_STATUS.READY_TO_KEY}' if the fixed fee adjustment is less than zero`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(0)
        .build();
      jest.mocked(calculatePrincipalBalanceAdjustment).mockReturnValue(0);
      jest.mocked(calculateFixedFeeAdjustment).mockReturnValue(-0.01);

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
    });

    it(`updates the fee record status to '${FEE_RECORD_STATUS.READY_TO_KEY}' if the principal balance adjustment is greater than zero`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(0)
        .build();
      jest.mocked(calculatePrincipalBalanceAdjustment).mockReturnValue(0.01);
      jest.mocked(calculateFixedFeeAdjustment).mockReturnValue(0);

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
    });

    it(`updates the fee record status to '${FEE_RECORD_STATUS.READY_TO_KEY}' if the principal balance adjustment is less than zero`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(0)
        .build();
      jest.mocked(calculatePrincipalBalanceAdjustment).mockReturnValue(-0.01);
      jest.mocked(calculateFixedFeeAdjustment).mockReturnValue(0);

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
    });

    it(`updates the fee record status to '${FEE_RECORD_STATUS.RECONCILED}' if the principal balance adjustment, fixed fee adjustment and fees paid to ukef for the period are all zero`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(0)
        .build();
      jest.mocked(calculatePrincipalBalanceAdjustment).mockReturnValue(0);
      jest.mocked(calculateFixedFeeAdjustment).mockReturnValue(0);

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.RECONCILED);
    });

    it("sets the fee record 'lastUpdatedByIsSystemUser' field to false", async () => {
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
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    });

    it("sets the fee record 'lastUpdatedByPortalUserId' to null", async () => {
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
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
    });

    it("sets the fee record 'lastUpdatedByTfmUserId' to the request source user id", async () => {
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
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
    });

    it('updates the facility utilisation data entity attached to the fee record', async () => {
      // Arrange
      const facilityUtilisationDataEntity = FacilityUtilisationDataEntityMockBuilder.forId('11111111').build();
      const feeRecord = aMatchingFeeRecord();
      feeRecord.facilityUtilisationData = facilityUtilisationDataEntity;
      feeRecord.facilityUtilisation = 9876543.21;

      const reportPeriod: ReportPeriod = {
        start: { month: 4, year: 2024 },
        end: { month: 5, year: 2025 },
      };

      const ukefShareOfUtilisation = 78787.87;
      jest.mocked(calculateUkefShareOfUtilisation).mockReturnValue(78787.87);

      const { coverEndDate, interestPercentage, dayCountBasis } = keyingSheetCalculationFacilityValues;

      const fixedFee = calculateFixedFee({
        ukefShareOfUtilisation,
        reportPeriod,
        coverEndDate,
        interestPercentage,
        dayCountBasis,
      });

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod,
        requestSource,
      });

      // Assert
      expect(updateFacilityUtilisationData).toHaveBeenCalledWith(facilityUtilisationDataEntity, {
        fixedFee,
        reportPeriod,
        requestSource,
        ukefShareOfUtilisation: 78787.87,
        entityManager: mockEntityManager,
      });
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

    it('saves the updated fee record with the supplied entity manager', async () => {
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
      expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
    });

    it(`updates the fee record status to '${FEE_RECORD_STATUS.READY_TO_KEY}' if fees paid to ukef is greater than zero`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(0.01)
        .build();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
    });

    it(`updates the fee record status to '${FEE_RECORD_STATUS.RECONCILED}' if fees paid to ukef is equal to zero`, async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(0)
        .build();

      // Act
      await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
        transactionEntityManager: mockEntityManager,
        isFinalFeeRecordForFacility,
        reportPeriod: aReportPeriod(),
        requestSource,
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.RECONCILED);
    });

    it("sets the fee record 'lastUpdatedByIsSystemUser' field to false", async () => {
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
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    });

    it("sets the fee record 'lastUpdatedByPortalUserId' to null", async () => {
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
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
    });

    it("sets the fee record 'lastUpdatedByTfmUserId' to the request source user id", async () => {
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
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
    });

    it('does not update the facility utilisation data entity attached to the fee record', async () => {
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
      expect(updateFacilityUtilisationData).not.toHaveBeenCalled();
    });
  });

  function aReconciliationInProgressReport() {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }

  function aFacilityUtilisationDataEntity() {
    return FacilityUtilisationDataEntityMockBuilder.forId('12345678').build();
  }
});
