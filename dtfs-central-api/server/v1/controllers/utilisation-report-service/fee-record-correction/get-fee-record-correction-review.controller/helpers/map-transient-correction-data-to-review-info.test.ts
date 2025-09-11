import {
  FeeRecordEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  anEmptyRecordCorrectionTransientFormData,
  FeeRecordCorrectionEntityMockBuilder,
} from '@ukef/dtfs2-common/test-helpers';
import { CURRENCY, FeeRecordCorrectionReviewInformation, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { mapTransientCorrectionDataToReviewInformation } from './map-transient-correction-data-to-review-info';
import { mapCorrectionReasonsToFormattedOldFeeRecordValues } from '../../../../../../helpers/map-correction-reasons-to-formatted-old-fee-record-values';
import { mapFormDataToFormattedValues } from './map-form-data-values';

console.error = jest.fn();

describe('get-fee-record-correction-review.controller map-transient-correction-data-to-review-info helpers', () => {
  describe('mapTransientCorrectionDataToReviewInformation', () => {
    it('should return an object containing the expected fee record correction review information', () => {
      // Arrange
      const bankId = '7';

      const utilisationReportEntity = new UtilisationReportEntityMockBuilder().withBankId(bankId).build();

      const facilityId = '7';
      const exporter = 'A sample exporter.';
      const reportedCurrency = CURRENCY.GBP;
      const reportedFee = 123.45;

      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(utilisationReportEntity)
        .withFacilityId(facilityId)
        .withExporter(exporter)
        .withFeesPaidToUkefForThePeriodCurrency(reportedCurrency)
        .withFeesPaidToUkefForThePeriod(reportedFee)
        .build();

      const correctionId = 7;
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, RECORD_CORRECTION_REASON.OTHER];
      const additionalInfo = 'Some additional info.';

      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecordEntity, false)
        .withId(correctionId)
        .withReasons(reasons)
        .withAdditionalInfo(additionalInfo)
        .build();

      const transientFormData = {
        ...anEmptyRecordCorrectionTransientFormData(),
        facilityId: '77777777',
        reportedFee: 987.65,
        additionalComments: 'Some bank commentary',
      };

      const expectedReviewInformation: FeeRecordCorrectionReviewInformation = {
        correctionId,
        feeRecord: {
          exporter,
          reportedFees: {
            currency: reportedCurrency,
            amount: reportedFee,
          },
        },
        reasons,
        errorSummary: additionalInfo,
        formattedOldValues: mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecordEntity, reasons).join(', '),
        formattedNewValues: mapFormDataToFormattedValues(transientFormData, reasons).join(', '),
        bankCommentary: transientFormData.additionalComments,
      };

      // Act
      const reviewInformation = mapTransientCorrectionDataToReviewInformation(transientFormData, feeRecordCorrectionEntity);

      // Assert
      expect(reviewInformation).toEqual<FeeRecordCorrectionReviewInformation>(expectedReviewInformation);
    });
  });
});
