import { CURRENCY, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import {
  getFormValueForReason,
  getValidationErrorsForRequiredFormValues,
  hasValidationErrors,
  validateNoUnexpectedFormValues,
  validateRecordCorrectionTransientFormValues,
} from './validate-record-correction-transient-form-values';
import { TfmFacilitiesRepo } from '../../../../../../repositories/tfm-facilities-repo';

describe('validate-record-correction-transient-form-values', () => {
  describe('getFormValueForReason', () => {
    it(`should return facilityId when reason is ${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}`, () => {
      // Arrange
      const facilityId = '12345678';
      const formValues = { facilityId };
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(facilityId);
    });

    it(`should return reportedCurrency when reason is ${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}`, () => {
      // Arrange
      const reportedCurrency = CURRENCY.GBP;
      const formValues = { reportedCurrency };
      const reason = RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(reportedCurrency);
    });

    it(`should return reportedFee when reason is ${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}`, () => {
      // Arrange
      const reportedFee = '1,234.56';
      const formValues = { reportedFee };
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(reportedFee);
    });

    it(`should return utilisation when reason is ${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}`, () => {
      // Arrange
      const utilisation = '10,000.23';
      const formValues = { utilisation };
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(utilisation);
    });

    it(`should return additionalComments when reason is ${RECORD_CORRECTION_REASON.OTHER}`, () => {
      // Arrange
      const additionalComments = 'An additional bank comment';
      const formValues = { additionalComments };
      const reason = RECORD_CORRECTION_REASON.OTHER;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(additionalComments);
    });

    it('should return undefined when form value is not present for reason', () => {
      // Arrange
      const formValues = {};
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should throw error for invalid reason', () => {
      // Arrange
      const formValues = {};
      const reason = 'INVALID_REASON' as RecordCorrectionReason;

      // Act & Assert
      expect(() => getFormValueForReason(formValues, reason)).toThrow('Invalid record correction reason: INVALID_REASON');
    });
  });

  describe('validateNoUnexpectedFormValues', () => {
    it('should throw error when form value is present for an unexpected reason', () => {
      // Arrange
      const formValues = {
        utilisation: '10000.00',
        reportedFee: '500.00',
      };
      const reasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];

      // Act & Assert
      expect(() => validateNoUnexpectedFormValues(formValues, reasons)).toThrow(
        `Unexpected form value "500.00" for reason "${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}" not in the correction request reasons.`,
      );
    });

    it('should not throw error when form values match expected reasons', () => {
      // Arrange
      const formValues = {
        reportedCurrency: CURRENCY.GBP,
        reportedFee: '123.45',
      };
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

      // Act & Assert
      expect(() => validateNoUnexpectedFormValues(formValues, reasons)).not.toThrow();
    });

    it('should not throw error when there are form values for unexpected reasons are set to "undefined"', () => {
      // Arrange
      const formValues = {
        reportedFee: '123.45',
        reportedCurrency: undefined,
      };
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

      // Act & Assert
      expect(() => validateNoUnexpectedFormValues(formValues, reasons)).not.toThrow();
    });

    it(`should not throw error when an "additionalComments" form value is provided and "${RECORD_CORRECTION_REASON.OTHER}" is not in the correction reasons`, () => {
      // Arrange
      const formValues = {
        reportedCurrency: CURRENCY.GBP,
        additionalComments: 'Some additional comment',
      };
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

      // Act & Assert
      expect(() => validateNoUnexpectedFormValues(formValues, reasons)).not.toThrow();
    });
  });

  describe('getValidationErrorsForRequiredFormValues', () => {
    describe('when validating facility ID', () => {
      beforeEach(() => {
        jest.spyOn(TfmFacilitiesRepo, 'ukefGefFacilityExists').mockResolvedValue(false);
      });

      it('should return validation error when facility ID is invalid', async () => {
        // Arrange
        const formValues = { facilityId: '123' };
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

        // Act
        const validationErrors = await getValidationErrorsForRequiredFormValues(formValues, reasons);

        // Assert
        const expectedFacilityIdErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';
        const expectedErrors = {
          facilityIdErrorMessage: expectedFacilityIdErrorMessage,
        };

        expect(validationErrors).toEqual(expectedErrors);
      });
    });

    describe('when validating reported currency', () => {
      it('should return validation error when currency is invalid', async () => {
        // Arrange
        const formValues = { reportedCurrency: 'INVALID' };
        const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

        // Act
        const validationErrors = await getValidationErrorsForRequiredFormValues(formValues, reasons);

        // Assert
        const expectedReportedCurrencyErrorMessage = 'You must select a currency';
        const expectedErrors = {
          reportedCurrencyErrorMessage: expectedReportedCurrencyErrorMessage,
        };

        expect(validationErrors).toEqual(expectedErrors);
      });
    });

    describe('when validating reported fee', () => {
      it('should return validation error when fee amount is invalid', async () => {
        // Arrange
        const formValues = { reportedFee: 'invalid amount' };
        const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

        // Act
        const validationErrors = await getValidationErrorsForRequiredFormValues(formValues, reasons);

        // Assert
        const expectedReportedFeeErrorMessage = 'You must enter the reported fee in a valid format';
        const expectedErrors = {
          reportedFeeErrorMessage: expectedReportedFeeErrorMessage,
        };

        expect(validationErrors).toEqual(expectedErrors);
      });
    });

    describe('when validating utilisation', () => {
      it('should return validation error when utilisation amount is invalid', async () => {
        // Arrange
        const formValues = { utilisation: 'invalid amount' };
        const reasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];

        // Act
        const validationErrors = await getValidationErrorsForRequiredFormValues(formValues, reasons);

        // Assert
        const expectedUtilisationErrorMessage = 'You must enter the utilisation in a valid format';
        const expectedErrors = {
          utilisationErrorMessage: expectedUtilisationErrorMessage,
        };

        expect(validationErrors).toEqual(expectedErrors);
      });
    });

    describe('when validating additional comments', () => {
      it('should return validation error when comments are missing', async () => {
        // Arrange
        const formValues = { additionalComments: undefined };
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        // Act
        const validationErrors = await getValidationErrorsForRequiredFormValues(formValues, reasons);

        // Assert
        const expectedAdditionalCommentsErrorMessage = 'You must enter a comment';
        const expectedErrors = {
          additionalCommentsErrorMessage: expectedAdditionalCommentsErrorMessage,
        };

        expect(validationErrors).toEqual(expectedErrors);
      });
    });

    describe('when validating multiple reasons', () => {
      it('should return multiple validation errors when multiple fields are invalid', async () => {
        // Arrange
        const formValues = {
          facilityId: '123',
          reportedCurrency: 'INVALID',
        };
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

        // Act
        const validationErrors = await getValidationErrorsForRequiredFormValues(formValues, reasons);

        // Assert
        const expectedFacilityIdErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';
        const expectedReportedCurrencyErrorMessage = 'You must select a currency';

        const expectedErrors = {
          facilityIdErrorMessage: expectedFacilityIdErrorMessage,
          reportedCurrencyErrorMessage: expectedReportedCurrencyErrorMessage,
        };

        expect(validationErrors).toEqual(expectedErrors);
      });
    });

    describe('when validating with invalid reason', () => {
      it('should throw error for invalid reason', async () => {
        // Arrange
        const formValues = {};
        const reasons = ['INVALID_REASON' as RecordCorrectionReason];

        // Act & Assert
        await expect(getValidationErrorsForRequiredFormValues(formValues, reasons)).rejects.toThrow('Invalid record correction reason: INVALID_REASON');
      });
    });
  });

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
      const expectedExceptionMessage = `Unexpected form value "${CURRENCY.USD}" for reason "${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}" not in the correction request reasons.`;

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
