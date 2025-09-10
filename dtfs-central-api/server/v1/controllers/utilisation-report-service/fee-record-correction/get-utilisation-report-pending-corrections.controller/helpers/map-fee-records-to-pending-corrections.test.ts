import { FeeRecordEntityMockBuilder, FeeRecordCorrectionEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { CURRENCY, FEE_RECORD_STATUS, FeeRecordEntity, PendingCorrection, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { mapFeeRecordsToPendingCorrections, mapFeeRecordToPendingCorrectionsArray } from './map-fee-records-to-pending-corrections';

describe('map-fee-records-to-pending-corrections', () => {
  describe('mapFeeRecordToPendingCorrectionsArray', () => {
    it(`should return an empty array if the fee record doesn't have any corrections`, () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder().withId(1).withFacilityId('12345678').withExporter('Test Exporter').withCorrections([]).build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return an empty array if all the fee records corrections are completed', () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder()
        .withId(1)
        .withFacilityId('12345678')
        .withExporter('Test Exporter')
        .withCorrections([FeeRecordCorrectionEntityMockBuilder.forIsCompleted(true).build()])
        .build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return the pending corrections of the fee record mapped to the response field', () => {
      // Arrange
      const feesPaidToUkefForThePeriod = 1000;
      const feesPaidToUkefForThePeriodCurrency = CURRENCY.JPY;
      const exporter = 'Test Exporter';
      const facilityId = '12345678';

      const feeRecord = new FeeRecordEntityMockBuilder()
        .withId(1)
        .withFacilityId(facilityId)
        .withExporter(exporter)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withCorrections([
          FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false)
            .withId(1)
            .withAdditionalInfo('Pending correction 1')
            .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
            .build(),
          FeeRecordCorrectionEntityMockBuilder.forIsCompleted(true)
            .withId(2)
            .withAdditionalInfo('Completed correction')
            .withReasons([RECORD_CORRECTION_REASON.OTHER])
            .build(),
          FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false)
            .withId(3)
            .withAdditionalInfo('Pending correction 2')
            .withReasons([RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT])
            .build(),
        ])
        .build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual<PendingCorrection[]>([
        {
          correctionId: 1,
          facilityId,
          exporter,
          additionalInfo: 'Pending correction 1',
          reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT],
          reportedFees: {
            currency: feesPaidToUkefForThePeriodCurrency,
            amount: feesPaidToUkefForThePeriod,
          },
        },
        {
          correctionId: 3,
          facilityId,
          exporter,
          additionalInfo: 'Pending correction 2',
          reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT],
          reportedFees: {
            currency: feesPaidToUkefForThePeriodCurrency,
            amount: feesPaidToUkefForThePeriod,
          },
        },
      ]);
    });
  });

  describe('mapFeeRecordsToPendingCorrections', () => {
    it('should return an empty array if there are no fee records', () => {
      // Arrange
      const feeRecords: FeeRecordEntity[] = [];

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual([]);
    });

    it(`should return an empty array if none of the fee records have status ${FEE_RECORD_STATUS.PENDING_CORRECTION}`, () => {
      // Arrange
      const statusesExludingPendingCorrection = Object.values(FEE_RECORD_STATUS).filter((status) => status !== FEE_RECORD_STATUS.PENDING_CORRECTION);
      const feeRecords = statusesExludingPendingCorrection.map((status) =>
        new FeeRecordEntityMockBuilder()
          .withStatus(status)
          .withCorrections([FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withAdditionalInfo('Pending correction 1').build()])
          .build(),
      );

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual([]);
    });

    it(`should return an empty array if none of the ${FEE_RECORD_STATUS.PENDING_CORRECTION} fee records have corrections`, () => {
      // Arrange
      const feeRecords = [
        new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).withCorrections([]).build(),
        new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).withCorrections([]).build(),
      ];

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual([]);
    });

    it(`should return an empty array if all of the ${FEE_RECORD_STATUS.PENDING_CORRECTION} fee records' corrections are completed`, () => {
      // Arrange
      const feeRecords = [
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([FeeRecordCorrectionEntityMockBuilder.forIsCompleted(true).build()])
          .build(),
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([FeeRecordCorrectionEntityMockBuilder.forIsCompleted(true).build()])
          .build(),
      ];

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual([]);
    });

    it(`should return an array of all of the pending corrections of the fee records if the fee records have pending corrections`, () => {
      // Arrange
      const feeRecords = [
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([
            FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withAdditionalInfo('Pending correction 1').build(),
            FeeRecordCorrectionEntityMockBuilder.forIsCompleted(true).withAdditionalInfo('Completed correction').build(),
          ])
          .build(),
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withAdditionalInfo('Pending correction 2').build()])
          .build(),
      ];

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual<PendingCorrection[]>([
        ...mapFeeRecordToPendingCorrectionsArray(feeRecords[0]),
        ...mapFeeRecordToPendingCorrectionsArray(feeRecords[1]),
      ]);
    });
  });
});
