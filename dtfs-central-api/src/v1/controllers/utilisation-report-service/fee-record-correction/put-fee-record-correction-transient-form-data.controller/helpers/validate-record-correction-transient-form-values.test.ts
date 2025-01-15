import { RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { getValidationErrorsForRequiredFormValues } from './validate-record-correction-transient-form-values';
import { TfmFacilitiesRepo } from '../../../../../../repositories/tfm-facilities-repo';

describe('validate-record-correction-transient-form-values', () => {
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
        const expectedErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';
        expect(validationErrors.facilityIdErrorMessage).toBe(expectedErrorMessage);
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
        const expectedErrorMessage = 'You must select a currency';
        expect(validationErrors.reportedCurrencyErrorMessage).toBe(expectedErrorMessage);
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
        const expectedErrorMessage = 'You must enter the reported fee in a valid format';
        expect(validationErrors.reportedFeeErrorMessage).toBe(expectedErrorMessage);
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
        const expectedErrorMessage = 'You must enter the utilisation in a valid format';
        expect(validationErrors.utilisationErrorMessage).toBe(expectedErrorMessage);
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
        const expectedErrorMessage = 'You must enter a comment';
        expect(validationErrors.additionalCommentsErrorMessage).toBe(expectedErrorMessage);
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
        const expectedFacilityIdError = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';
        const expectedCurrencyError = 'You must select a currency';
        expect(validationErrors.facilityIdErrorMessage).toBe(expectedFacilityIdError);
        expect(validationErrors.reportedCurrencyErrorMessage).toBe(expectedCurrencyError);
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
});
