import {
  CURRENCY,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordCorrectionReviewInformation,
  FeeRecordEntityMockBuilder,
  getFormattedMonetaryValue,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { getFormattedFormDataValueForCorrectionReason, mapFormDataToFormattedValues, mapTransientCorrectionDataToReviewInformation } from './helpers';
import { mapCorrectionReasonsToFormattedOldValues } from '../../../../../helpers/map-correction-reasons-to-formatted-values';

console.error = jest.fn();

describe('get-fee-record-correction-review.controller helpers', () => {
  describe('getFormattedFormDataValueForCorrectionReason', () => {
    it(`should map form data value for reason "${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}" to original value`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const facilityId = 'some-value';
      const formData = {
        facilityId,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(facilityId);
    });

    it(`should map form data value for reason "${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}" to original value`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT;
      const reportedCurrency = CURRENCY.GBP;
      const formData = {
        reportedCurrency,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(reportedCurrency);
    });

    it(`should map form data value for reason "${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}" to formatted monetary value`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;
      const reportedFee = 123.45;
      const formData = {
        reportedFee,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(reportedFee));
    });

    it(`should map form data value for reason "${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}" to formatted monetary value`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;
      const utilisation = 10000.23;
      const formData = {
        utilisation,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(utilisation));
    });

    it(`should throw an error for unsupported reason "${RECORD_CORRECTION_REASON.OTHER}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.OTHER;
      const formData = {};

      // Act & Assert
      expect(() => getFormattedFormDataValueForCorrectionReason(formData, reason)).toThrow();
    });
  });

  describe('mapFormDataToFormattedValues', () => {
    it('should return an empty array if no reasons are provided', () => {
      // Arrange
      const reasons: RecordCorrectionReason[] = [];
      const formData = {};

      // Act
      const formattedValues = mapFormDataToFormattedValues(formData, reasons);

      // Assert
      expect(formattedValues).toEqual([]);
    });

    it(`should return an empty array if "${RECORD_CORRECTION_REASON.OTHER}" is the only reason provided`, () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.OTHER];
      const formData = {
        additionalComments: 'Some additional comments',
      };

      // Act
      const formattedValues = mapFormDataToFormattedValues(formData, reasons);

      // Assert
      expect(formattedValues).toEqual([]);
    });

    it(`should return the expected array of formatted form data values when all reasons are provided`, () => {
      // Arrange
      const reasons = Object.values(RECORD_CORRECTION_REASON);
      const formData = {
        utilisation: 10000.23,
        reportedCurrency: CURRENCY.GBP,
        reportedFee: 123.45,
        facilityId: '11111111',
        additionalComments: 'Some additional comments',
      };

      const expectedFormattedValues = [
        formData.facilityId,
        formData.reportedCurrency,
        getFormattedMonetaryValue(formData.reportedFee),
        getFormattedMonetaryValue(formData.utilisation),
      ];

      // Act
      const formattedValues = mapFormDataToFormattedValues(formData, reasons);

      // Assert
      expect(formattedValues).toHaveLength(4);
      expect(formattedValues).toEqual(expectedFormattedValues);
    });
  });

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

      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecordEntity)
        .withId(correctionId)
        .withReasons(reasons)
        .withAdditionalInfo(additionalInfo)
        .build();

      const transientFormData = {
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
        formattedOldValues: mapCorrectionReasonsToFormattedOldValues(feeRecordEntity, reasons).join(', '),
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
