import { FEE_RECORD_STATUS, FeeRecordCorrectionEntityMockBuilder, FeeRecordEntity, FeeRecordEntityMockBuilder, PendingCorrection } from '@ukef/dtfs2-common';
import { mapFeeRecordsToPendingCorrections, mapFeeRecordToPendingCorrectionsArray } from './map-fee-records-to-pending-corrections';

describe('map-fee-records-to-pending-corrections', () => {
  describe('mapFeeRecordToPendingCorrectionsArray', () => {
    it(`should return an empty array if the fee record doesn't have any corrections`, () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder().withId(1).withFacilityId('FAC123').withExporter('Test Exporter').withCorrections([]).build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return an empty array if all the fee records corrections are completed', () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder()
        .withId(1)
        .withFacilityId('FAC123')
        .withExporter('Test Exporter')
        .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).build()])
        .build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return the pending corrections of the fee record mapped to the response field', () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder()
        .withId(1)
        .withFacilityId('FAC123')
        .withExporter('Test Exporter')
        .withCorrections([
          new FeeRecordCorrectionEntityMockBuilder().withId(1).withIsCompleted(false).withAdditionalInfo('Pending correction 1').build(),
          new FeeRecordCorrectionEntityMockBuilder().withId(2).withIsCompleted(true).withAdditionalInfo('Completed correction').build(),
          new FeeRecordCorrectionEntityMockBuilder().withId(3).withIsCompleted(false).withAdditionalInfo('Pending correction 2').build(),
        ])
        .build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual<PendingCorrection[]>([
        {
          correctionId: 1,
          facilityId: 'FAC123',
          exporter: 'Test Exporter',
          additionalInfo: 'Pending correction 1',
        },
        {
          correctionId: 3,
          facilityId: 'FAC123',
          exporter: 'Test Exporter',
          additionalInfo: 'Pending correction 2',
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
          .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(false).withAdditionalInfo('Pending correction 1').build()])
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
          .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).build()])
          .build(),
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).build()])
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
            new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(false).withAdditionalInfo('Pending correction 1').build(),
            new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).withAdditionalInfo('Completed correction').build(),
          ])
          .build(),
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(false).withAdditionalInfo('Pending correction 2').build()])
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
