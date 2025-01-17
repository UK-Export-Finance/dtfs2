import { RECORD_CORRECTION_REASON, MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../../repositories/tfm-facilities-repo';
import { getAdditionalCommentsValidationError, getFacilityIdValidationError } from './get-record-correction-transient-form-validation-error';

describe('get-record-correction-transient-form-validation-error', () => {
  describe('getAdditionalCommentsValidationError', () => {
    const requiredCommentErrorMessage = 'You must enter a comment';

    describe('when "additionalComments" is undefined', () => {
      const reasons = [RECORD_CORRECTION_REASON.OTHER];
      const additionalComments = undefined;

      it('should return error message', () => {
        // Act
        const errorMessage = getAdditionalCommentsValidationError(reasons, additionalComments);

        // Assert
        expect(errorMessage).toEqual(requiredCommentErrorMessage);
      });
    });

    describe('when "additionalComments" is an empty string', () => {
      const reasons = [RECORD_CORRECTION_REASON.OTHER];
      const additionalComments = '';

      it('should return error message', () => {
        // Act
        const errorMessage = getAdditionalCommentsValidationError(reasons, additionalComments);

        // Assert
        expect(errorMessage).toEqual(requiredCommentErrorMessage);
      });
    });

    describe('when "additionalComments" is only whitespace', () => {
      const reasons = [RECORD_CORRECTION_REASON.OTHER];
      const additionalComments = '   ';

      it('should return error message', () => {
        // Act
        const errorMessage = getAdditionalCommentsValidationError(reasons, additionalComments);

        // Assert
        expect(errorMessage).toEqual(requiredCommentErrorMessage);
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
    const invalidFormatErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';

    describe('when facility id is undefined', () => {
      it('should return "invalid format" error message', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError(undefined);

        // Assert
        expect(errorMessage).toBe(invalidFormatErrorMessage);
      });
    });

    describe('when facility id does not match required format', () => {
      it('should return "invalid format" error message for a non-numeric id', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('ABC12345');

        // Assert
        expect(errorMessage).toBe(invalidFormatErrorMessage);
      });

      it('should return "invalid format" error message for an id below the minimum length', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('1234567');

        // Assert
        expect(errorMessage).toBe(invalidFormatErrorMessage);
      });

      it('should return "invalid format" error message for an id above the maximum length', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('12345678901');

        // Assert
        expect(errorMessage).toBe(invalidFormatErrorMessage);
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
});
