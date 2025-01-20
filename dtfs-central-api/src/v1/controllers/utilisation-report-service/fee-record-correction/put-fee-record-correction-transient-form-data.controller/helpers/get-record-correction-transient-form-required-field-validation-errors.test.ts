import { CURRENCY, MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../../repositories/tfm-facilities-repo';
import { getValidationErrorsForFormValues } from './get-record-correction-transient-form-required-field-validation-errors';

describe('get-record-correction-transient-form-required-field-validation-errors', () => {
  describe('getValidationErrorsForFormValues', () => {
    describe('when validating facility ID', () => {
      beforeEach(() => {
        jest.spyOn(TfmFacilitiesRepo, 'ukefGefFacilityExists').mockResolvedValue(false);
      });

      it('should return validation error when facility ID is invalid', async () => {
        // Arrange
        const formValues = { facilityId: '123' };
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

        // Act
        const validationErrors = await getValidationErrorsForFormValues(formValues, reasons);

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
        const validationErrors = await getValidationErrorsForFormValues(formValues, reasons);

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
        const validationErrors = await getValidationErrorsForFormValues(formValues, reasons);

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
        const validationErrors = await getValidationErrorsForFormValues(formValues, reasons);

        // Assert
        const expectedUtilisationErrorMessage = 'You must enter the utilisation in a valid format';
        const expectedErrors = {
          utilisationErrorMessage: expectedUtilisationErrorMessage,
        };

        expect(validationErrors).toEqual(expectedErrors);
      });
    });

    describe('when validating additional comments', () => {
      const requiredAdditionalCommentsErrorMessage = 'You must enter a comment';

      describe(`and "${RECORD_CORRECTION_REASON.OTHER}" is a correction reason`, () => {
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        it('should return validation error when comments are missing', async () => {
          // Arrange
          const formValues = { additionalComments: undefined };

          // Act
          const validationErrors = await getValidationErrorsForFormValues(formValues, reasons);

          // Assert
          const expectedAdditionalCommentsErrorMessage = requiredAdditionalCommentsErrorMessage;
          const expectedErrors = {
            additionalCommentsErrorMessage: expectedAdditionalCommentsErrorMessage,
          };

          expect(validationErrors).toEqual(expectedErrors);
        });
      });

      describe(`and "${RECORD_CORRECTION_REASON.OTHER}" is not a correction reason`, () => {
        const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

        it('should not return a validation error when comments are missing', async () => {
          // Arrange
          const formValues = {
            reportedCurrency: CURRENCY.GBP,
            additionalComments: undefined,
          };

          // Act
          const validationErrors = await getValidationErrorsForFormValues(formValues, reasons);

          // Assert
          const expectedErrors = {};

          expect(validationErrors).toEqual(expectedErrors);
        });

        it('should return validation error when comments are over the maximum character limit', async () => {
          // Arrange
          const additionalComments = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1);
          const formValues = {
            reportedCurrency: CURRENCY.GBP,
            additionalComments,
          };

          // Act
          const validationErrors = await getValidationErrorsForFormValues(formValues, reasons);

          // Assert
          const expectedAdditionalCommentsErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the additional comments box`;
          const expectedErrors = {
            additionalCommentsErrorMessage: expectedAdditionalCommentsErrorMessage,
          };

          expect(validationErrors).toEqual(expectedErrors);
        });
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
        const validationErrors = await getValidationErrorsForFormValues(formValues, reasons);

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
        await expect(getValidationErrorsForFormValues(formValues, reasons)).rejects.toThrow('Invalid record correction reason: INVALID_REASON');
      });
    });
  });
});
