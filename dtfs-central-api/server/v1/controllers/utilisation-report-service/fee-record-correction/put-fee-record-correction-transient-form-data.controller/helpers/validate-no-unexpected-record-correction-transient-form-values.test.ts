import { CURRENCY, InvalidPayloadError, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { validateNoUnexpectedFormValues } from './validate-no-unexpected-record-correction-transient-form-values';

describe('validate-no-unexpected-record-correction-transient-form-values', () => {
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
        new InvalidPayloadError(`Expected form field "reportedFee" to be undefined as it does not have an associated reason in the correction request.`),
      );
    });

    it('should not throw error when form values match expected reasons', () => {
      // Arrange
      const formValues = {
        reportedCurrency: CURRENCY.GBP,
        reportedFee: '123.45',
        additionalComments: 'Some additional comment',
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
});
