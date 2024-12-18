import {
  CURRENCY,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { mapFeeRecordCorrectionEntityToResponse } from './helpers';
import { mapFeeRecordEntityToReportedFees } from '../../../../../mapping/fee-record-mapper';

describe('get-fee-record-correction.controller helpers', () => {
  describe('mapFeeRecordCorrectionEntityToResponse', () => {
    it('should return an object containing the fee record correction id', () => {
      // Arrange
      const correctionId = 7;
      const feeRecordCorrectionEntity = new FeeRecordCorrectionEntityMockBuilder().withId(correctionId).build();

      // Act
      const response = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Assert
      expect(response.id).toEqual(correctionId);
    });

    it('should return an object containing the fee record correction bank id', () => {
      // Arrange
      const bankId = '7';

      const utilisationReportEntity = new UtilisationReportEntityMockBuilder().withBankId(bankId).build();
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(utilisationReportEntity).build();
      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecordEntity).build();

      // Act
      const response = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Assert
      expect(response.bankId).toEqual(bankId);
    });

    it('should return an object containing the fee record correction facility id', () => {
      // Arrange
      const facilityId = '7';

      const feeRecordEntity = new FeeRecordEntityMockBuilder().withFacilityId(facilityId).build();
      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecordEntity).build();

      // Act
      const response = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Assert
      expect(response.facilityId).toEqual(facilityId);
    });

    it('should return an object containing the fee record correction exporter', () => {
      // Arrange
      const exporter = 'A sample exporter.';

      const feeRecordEntity = new FeeRecordEntityMockBuilder().withExporter(exporter).build();
      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecordEntity).build();

      // Act
      const response = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Assert
      expect(response.exporter).toEqual(exporter);
    });

    it('should return an object containing the fee record correction reported fees', () => {
      // Arrange
      const reportedFeesCurrency = CURRENCY.GBP;
      const reportedFeesAmount = 7;

      const feeRecordEntity = new FeeRecordEntityMockBuilder()
        .withFeesPaidToUkefForThePeriodCurrency(reportedFeesCurrency)
        .withFeesPaidToUkefForThePeriod(reportedFeesAmount)
        .build();
      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecordEntity).build();

      const expectedReportedFees = mapFeeRecordEntityToReportedFees(feeRecordEntity);

      // Act
      const response = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Assert
      expect(response.reportedFees).toEqual(expectedReportedFees);
    });

    it('should return an object containing the fee record correction reasons', () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

      const feeRecordCorrectionEntity = new FeeRecordCorrectionEntityMockBuilder().withReasons(reasons).build();

      // Act
      const response = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Assert
      expect(response.reasons).toEqual(reasons);
    });

    it('should return an object containing the fee record correction additional info', () => {
      // Arrange
      const additionalInfo = 'Some additional info.';

      const feeRecordCorrectionEntity = new FeeRecordCorrectionEntityMockBuilder().withAdditionalInfo(additionalInfo).build();

      // Act
      const response = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Assert
      expect(response.additionalInfo).toEqual(additionalInfo);
    });
  });
});
