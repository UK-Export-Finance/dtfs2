import { MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT, CURRENCY, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../../repositories/tfm-facilities-repo';
import {
  getAdditionalCommentsValidationError,
  getFacilityIdValidationError,
  getReportedCurrencyValidationError,
  getReportedFeeValidationError,
  getUtilisationValidationError,
} from './get-record-correction-transient-form-validation-error';

describe('get-record-correction-transient-form-validation-error', () => {
  describe('getFacilityIdValidationError', () => {
    const invalidFormatErrorMessage = 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';

    describe('when facility id is undefined', () => {
      it('should return "invalid format" error message', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError(undefined);

        // Assert
        expect(errorMessage).toEqual(invalidFormatErrorMessage);
      });
    });

    describe('when facility id does not match required format', () => {
      it('should return "invalid format" error message for a non-numeric id', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('ABC12345');

        // Assert
        expect(errorMessage).toEqual(invalidFormatErrorMessage);
      });

      it('should return "invalid format" error message for an id below the minimum length', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('1234567');

        // Assert
        expect(errorMessage).toEqual(invalidFormatErrorMessage);
      });

      it('should return "invalid format" error message for an id above the maximum length', async () => {
        // Act
        const errorMessage = await getFacilityIdValidationError('12345678901');

        // Assert
        expect(errorMessage).toEqual(invalidFormatErrorMessage);
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

          expect(errorMessage).toEqual(expectedErrorMessage);
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

  describe('getReportedCurrencyValidationError', () => {
    describe('when currency is undefined', () => {
      const reportedCurrency = undefined;

      it('should return error message', () => {
        // Act
        const errorMessage = getReportedCurrencyValidationError(reportedCurrency);

        // Assert
        expect(errorMessage).toEqual('You must select a currency');
      });
    });

    describe('when currency is invalid', () => {
      const reportedCurrency = 'INVALID';

      it('should return error message', () => {
        // Act
        const errorMessage = getReportedCurrencyValidationError(reportedCurrency);

        // Assert
        expect(errorMessage).toEqual('You must select a currency');
      });
    });

    describe('when currency is valid', () => {
      const reportedCurrency = CURRENCY.GBP;

      it('should return undefined', () => {
        // Act
        const errorMessage = getReportedCurrencyValidationError(reportedCurrency);

        // Assert
        expect(errorMessage).toBeUndefined();
      });
    });
  });

  describe('getReportedFeeValidationError', () => {
    describe('when reported fee is undefined', () => {
      const reportedFee = undefined;

      it('should return error message', () => {
        // Act
        const errorMessage = getReportedFeeValidationError(reportedFee);

        // Assert
        expect(errorMessage).toEqual('You must enter the reported fee in a valid format');
      });
    });

    describe('when reported fee is an empty string', () => {
      const reportedFee = '';

      it('should return error message', () => {
        // Act
        const errorMessage = getReportedFeeValidationError(reportedFee);

        // Assert
        expect(errorMessage).toEqual('You must enter the reported fee in a valid format');
      });
    });

    describe('when reported fee is not a valid monetary amount', () => {
      const reportedFee = 'INVALID';

      it('should return error message', () => {
        // Act
        const errorMessage = getReportedFeeValidationError(reportedFee);

        // Assert
        expect(errorMessage).toEqual('You must enter the reported fee in a valid format');
      });
    });

    describe('when reported fee is a valid monetary amount', () => {
      const reportedFee = '1234.56';

      it('should return undefined', () => {
        // Act
        const errorMessage = getReportedFeeValidationError(reportedFee);

        // Assert
        expect(errorMessage).toBeUndefined();
      });
    });
  });

  describe('getUtilisationValidationError', () => {
    const invalidFormatErrorMessage = 'You must enter the utilisation in a valid format';

    describe('when utilisation is undefined', () => {
      const utilisation = undefined;

      it('should return error message', () => {
        // Act
        const errorMessage = getUtilisationValidationError(utilisation);

        // Assert
        expect(errorMessage).toEqual(invalidFormatErrorMessage);
      });
    });

    describe('when utilisation is an empty string', () => {
      const utilisation = '';

      it('should return error message', () => {
        // Act
        const errorMessage = getUtilisationValidationError(utilisation);

        // Assert
        expect(errorMessage).toEqual(invalidFormatErrorMessage);
      });
    });

    describe('when utilisation is not a valid monetary amount', () => {
      const utilisation = 'INVALID';

      it('should return error message', () => {
        // Act
        const errorMessage = getUtilisationValidationError(utilisation);

        // Assert
        expect(errorMessage).toEqual(invalidFormatErrorMessage);
      });
    });

    describe('when utilisation is a valid monetary amount', () => {
      const utilisation = '1234.56';

      it('should return undefined', () => {
        // Act
        const errorMessage = getUtilisationValidationError(utilisation);

        // Assert
        expect(errorMessage).toBeUndefined();
      });
    });
  });

  describe('getAdditionalCommentsValidationError', () => {
    const requiredCommentErrorMessage = 'You must enter a comment';

    describe('when the "additionalComments" field is required', () => {
      const isRequired = true;

      describe('and is undefined', () => {
        const isOtherSoleCorrectionReason = true;
        const additionalComments = undefined;

        it('should return error message', () => {
          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, additionalComments);

          // Assert
          expect(errorMessage).toEqual(requiredCommentErrorMessage);
        });
      });

      describe('and is an empty string', () => {
        const isOtherSoleCorrectionReason = true;
        const additionalComments = '';

        it('should return error message', () => {
          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, additionalComments);

          // Assert
          expect(errorMessage).toEqual(requiredCommentErrorMessage);
        });
      });

      describe('and contains only whitespace', () => {
        const isOtherSoleCorrectionReason = true;
        const additionalComments = '   ';

        it('should return error message', () => {
          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, additionalComments);

          // Assert
          expect(errorMessage).toEqual(requiredCommentErrorMessage);
        });
      });

      describe('and has a length less than the maximum', () => {
        const isOtherSoleCorrectionReason = true;
        const additionalComments = 'Some valid additional comments';

        it('should return undefined', () => {
          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, additionalComments);

          // Assert
          expect(errorMessage).toBeUndefined();
        });
      });

      describe('and exceeds the maximum length', () => {
        const longComment = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1);

        it(`should return error message referring to "record information box" when "${RECORD_CORRECTION_REASON.OTHER}" is the sole correction reason`, () => {
          // Arrange
          const isOtherSoleCorrectionReason = true;

          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, longComment);

          // Assert
          const expectedErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the record information box`;

          expect(errorMessage).toEqual(expectedErrorMessage);
        });

        it('should return error message referring to "additional comments box" for multiple reasons', () => {
          // Arrange
          const isOtherSoleCorrectionReason = false;

          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, longComment);

          // Assert
          const expectedErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the additional comments box`;

          expect(errorMessage).toEqual(expectedErrorMessage);
        });
      });
    });

    describe('when the "additionalComments" field is not required', () => {
      const isRequired = false;

      describe('and is undefined', () => {
        const isOtherSoleCorrectionReason = true;
        const additionalComments = undefined;

        it('should return undefined', () => {
          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, additionalComments);

          // Assert
          expect(errorMessage).toBeUndefined();
        });
      });

      describe('and is an empty string', () => {
        const isOtherSoleCorrectionReason = true;
        const additionalComments = '';

        it('should return undefined', () => {
          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, additionalComments);

          // Assert
          expect(errorMessage).toBeUndefined();
        });
      });

      describe('and contains only whitespace', () => {
        const isOtherSoleCorrectionReason = true;
        const additionalComments = '   ';

        it('should return undefined', () => {
          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, additionalComments);

          // Assert
          expect(errorMessage).toBeUndefined();
        });
      });

      describe('and has a length less than the maximum', () => {
        const isOtherSoleCorrectionReason = true;
        const additionalComments = 'Some valid additional comments';

        it('should return undefined', () => {
          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, additionalComments);

          // Assert
          expect(errorMessage).toBeUndefined();
        });
      });

      describe('and exceeds the maximum length', () => {
        const longComment = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1);

        it(`should return error message referring to "record information box" when "${RECORD_CORRECTION_REASON.OTHER}" is the sole correction reason`, () => {
          // Arrange
          const isOtherSoleCorrectionReason = true;

          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, longComment);

          // Assert
          const expectedErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the record information box`;

          expect(errorMessage).toEqual(expectedErrorMessage);
        });

        it('should return error message referring to "additional comments box" for multiple reasons', () => {
          // Arrange
          const isOtherSoleCorrectionReason = false;

          // Act
          const errorMessage = getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isRequired, longComment);

          // Assert
          const expectedErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the additional comments box`;

          expect(errorMessage).toEqual(expectedErrorMessage);
        });
      });
    });
  });
});
