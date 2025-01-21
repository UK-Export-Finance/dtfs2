import { CURRENCY, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { hasValidationErrors, validateRecordCorrectionTransientFormValues } from './validate-record-correction-transient-form-values';

describe('validate-record-correction-transient-form-values', () => {
  describe('hasValidationErrors', () => {
    it('should return true when validation errors object contains defined error messages', () => {
      // Arrange
      const validationErrors = {
        facilityIdErrorMessage: 'Invalid facility ID',
        reportedCurrencyErrorMessage: undefined,
        reportedFeeErrorMessage: 'Invalid fee',
      };

      // Act
      const result = hasValidationErrors(validationErrors);

      // Assert
      expect(result).toEqual(true);
    });

    it('should return false when validation errors object contains only undefined values', () => {
      // Arrange
      const validationErrors = {
        facilityIdErrorMessage: undefined,
        reportedCurrencyErrorMessage: undefined,
      };

      // Act
      const result = hasValidationErrors(validationErrors);

      // Assert
      expect(result).toEqual(false);
    });

    it('should return false when validation errors object is empty', () => {
      // Arrange
      const validationErrors = {};

      // Act
      const result = hasValidationErrors(validationErrors);

      // Assert
      expect(result).toEqual(false);
    });
  });

  describe('validateRecordCorrectionTransientFormValues', () => {
    it('should throw error if form value is present for an unexpected reason', async () => {
      // Arrange
      const formValues = {
        reportedFee: '123.45',
        reportedCurrency: CURRENCY.USD,
      };
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

      // Act & Assert
      const expectedExceptionMessage = `Expected form field "reportedCurrency" to be undefined as it does not have an associated reason in the correction request.`;

      await expect(validateRecordCorrectionTransientFormValues(formValues, reasons)).rejects.toThrow(expectedExceptionMessage);
    });

    it('should throw error if form value is invalid for an expected reason', async () => {
      // Arrange
      const formValues = {
        facilityId: '123',
      };
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

      // Act
      const { errors } = await validateRecordCorrectionTransientFormValues(formValues, reasons);

      // Assert
      const expectedFacilityIdErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';
      const expectedErrors = {
        facilityIdErrorMessage: expectedFacilityIdErrorMessage,
      };

      expect(errors).toEqual(expectedErrors);
    });

    it('should return no validation errors when only valid values for expected reasons are provided', async () => {
      // Arrange
      const formValues = {
        reportedCurrency: CURRENCY.JPY,
        reportedFee: '123.45',
        additionalComments: 'An additional comment',
      };
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

      // Act
      const { errors } = await validateRecordCorrectionTransientFormValues(formValues, reasons);

      // Assert
      expect(errors).toEqual({});
    });

    it('should validate multiple form values and return any validation errors', async () => {
      // Arrange
      const formValues = {
        reportedCurrency: CURRENCY.GBP,
        reportedFee: 'invalid-reported-fee',
        utilisation: 'invalid-utilisation',
        additionalComments: 'An additional comment',
      };
      const reasons = [
        RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
        RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
        RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
      ];

      // Act
      const { errors } = await validateRecordCorrectionTransientFormValues(formValues, reasons);

      // Assert
      const expectedReportedFeeErrorMessage = 'You must enter the reported fee in a valid format';
      const expectedUtilisationErrorMessage = 'You must enter the utilisation in a valid format';
      const expectedErrors = {
        reportedFeeErrorMessage: expectedReportedFeeErrorMessage,
        utilisationErrorMessage: expectedUtilisationErrorMessage,
      };

      expect(errors).toEqual(expectedErrors);
    });

    it('should validate missing required values', async () => {
      // Arrange
      const formValues = {
        utilisation: '10,000.23',
      };
      const reasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

      // Act
      const { errors } = await validateRecordCorrectionTransientFormValues(formValues, reasons);

      // Assert
      const expectedAdditionalCommentsErrorMessage = 'You must enter a comment';
      const expectedErrors = {
        additionalCommentsErrorMessage: expectedAdditionalCommentsErrorMessage,
      };

      expect(errors).toEqual(expectedErrors);
    });

    it('should handle empty form values object', async () => {
      // Arrange
      const formValues = {};
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

      // Act
      const { errors } = await validateRecordCorrectionTransientFormValues(formValues, reasons);

      // Assert
      const expectedReportedFeeErrorMessage = 'You must enter the reported fee in a valid format';
      const expectedErrors = {
        reportedFeeErrorMessage: expectedReportedFeeErrorMessage,
      };

      expect(errors).toEqual(expectedErrors);
    });

    it('should throw error for invalid reason', async () => {
      // Arrange
      const formValues = {};
      const reasons = ['INVALID_REASON' as RecordCorrectionReason];

      // Act & Assert
      const expectedExceptionMessage = 'Invalid record correction reason: INVALID_REASON';

      await expect(validateRecordCorrectionTransientFormValues(formValues, reasons)).rejects.toThrow(expectedExceptionMessage);
    });
  });
});
