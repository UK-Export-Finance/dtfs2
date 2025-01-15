import { RECORD_CORRECTION_REASON, MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT, RecordCorrectionReason } from '@ukef/dtfs2-common';
import {
  getAdditionalCommentsValidationError,
  getFacilityIdValidationError,
  getValidationErrorsForRequiredFormValues,
} from './validate-record-correction-transient-form-values';
import { TfmFacilitiesRepo } from '../../../../../../repositories/tfm-facilities-repo';

describe('validate-record-correction-transient-form-values', () => {
  describe('getAdditionalCommentsValidationError', () => {
    describe('when "additionalComments" is undefined', () => {
      const reasons = [RECORD_CORRECTION_REASON.OTHER];
      const additionalComments = undefined;

      it('should return error message', () => {
        // Act
        const errorMessage = getAdditionalCommentsValidationError(reasons, additionalComments);

        // Assert
        const expectedErrorMessage = 'You must enter a comment';

        expect(errorMessage).toEqual(expectedErrorMessage);
      });
    });

    describe('when "additionalComments" is an empty string', () => {
      const reasons = [RECORD_CORRECTION_REASON.OTHER];
      const additionalComments = '';

      it('should return error message', () => {
        // Act
        const errorMessage = getAdditionalCommentsValidationError(reasons, additionalComments);

        // Assert
        const expectedErrorMessage = 'You must enter a comment';

        expect(errorMessage).toEqual(expectedErrorMessage);
      });
    });

    describe('when "additionalComments" length is less than maximum', () => {
      const reasons = [RECORD_CORRECTION_REASON.OTHER];
      const additionalComments = 'Some valid additional comments';

      it('should return undefined', () => {
        // Act
        const errorMessage = getAdditionalCommentsValidationError(reasons, additionalComments);

        // Assert
        expect(errorMessage).toBeUndefined();
      });
    });

    describe('when "additionalComments" exceeds maximum length', () => {
      const longComment = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1);

      it('should return error message referring to "record information box" for single reason', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        // Act
        const errorMessage = getAdditionalCommentsValidationError(reasons, longComment);

        // Assert
        const expectedErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the record information box`;

        expect(errorMessage).toEqual(expectedErrorMessage);
      });

      it('should return error message referring to "additional comments box" for multiple reasons', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

        // Act
        const errorMessage = getAdditionalCommentsValidationError(reasons, longComment);

        // Assert
        const expectedErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the additional comments box`;

        expect(errorMessage).toEqual(expectedErrorMessage);
      });
    });
  });

  describe('getFacilityIdValidationError', () => {
    describe('when facility id is undefined', () => {
      it('should return "required format" error message', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError(undefined);

        // Assert
        const expectedErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';

        expect(errorMessage).toBe(expectedErrorMessage);
      });
    });

    describe('when facility id does not match required format', () => {
      it('should return "required format" error message for a non-numeric id', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('ABC12345');

        // Assert
        const expectedErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';

        expect(errorMessage).toBe(expectedErrorMessage);
      });

      it('should return "required format" error message for an id below the minimum length', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('1234567');

        // Assert
        const expectedErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';

        expect(errorMessage).toBe(expectedErrorMessage);
      });

      it('should return "required format" error message for an id above the maximum length', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('12345678901');

        // Assert
        const expectedErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';

        expect(errorMessage).toBe(expectedErrorMessage);
      });
    });

    describe('when facility id matches required format', () => {
      describe('when facility does not exist', () => {
        beforeEach(() => {
          jest.spyOn(TfmFacilitiesRepo, 'ukefGefFacilityExists').mockResolvedValue(false);
        });

        it('should return "unrecognised facility" error message', async () => {
          // Act
          const errorMessage = await getFacilityIdValidationError('12345678');

          // Assert
          const expectedErrorMessage = 'The facility ID entered has not been recognised, please enter a facility ID for a General Export Facility';

          expect(errorMessage).toBe(expectedErrorMessage);
        });
      });

      describe('when facility exists', () => {
        beforeEach(() => {
          jest.spyOn(TfmFacilitiesRepo, 'ukefGefFacilityExists').mockResolvedValue(true);
        });

        it.each([8, 9, 10])('should return undefined for %d digit id', async (digits) => {
          // Arrange
          const facilityId = '7'.repeat(digits);

          // Act
          const errorMessage = await getFacilityIdValidationError(facilityId);

          // Assert
          expect(errorMessage).toBeUndefined();
        });
      });
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
