import {
  CURRENCY,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { mapFeeRecordCorrectionEntityToResponse } from './helpers';
import { mapFeeRecordEntityToReportedFees } from '../../../../../mapping/fee-record-mapper';
import { GetFeeRecordCorrectionResponseBody } from '.';

describe('get-fee-record-correction.controller helpers', () => {
  describe('mapFeeRecordCorrectionEntityToResponse', () => {
    it('should return an object containing the fee record correction id', () => {
      // Arrange
      const bankId = '7';

      const utilisationReportEntity = new UtilisationReportEntityMockBuilder().withBankId(bankId).build();

      const facilityId = '7';
      const exporter = 'A sample exporter.';

      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(utilisationReportEntity)
        .withFacilityId(facilityId)
        .withExporter(exporter)
        .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
        .withFeesPaidToUkefForThePeriod(7)
        .build();

      const correctionId = 7;
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];
      const additionalInfo = 'Some additional info.';

      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecordEntity)
        .withId(correctionId)
        .withReasons(reasons)
        .withAdditionalInfo(additionalInfo)
        .build();

      const expectedReportedFees = mapFeeRecordEntityToReportedFees(feeRecordEntity);

      // Act
      const response = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Assert
      expect(response).toEqual<GetFeeRecordCorrectionResponseBody>({
        id: correctionId,
        bankId,
        facilityId,
        exporter,
        reportedFees: expectedReportedFees,
        reasons,
        additionalInfo,
      });
    });
  });
});
