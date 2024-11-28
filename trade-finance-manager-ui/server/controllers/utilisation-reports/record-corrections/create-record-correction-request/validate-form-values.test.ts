import { RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestFormValues } from '../../../../types/view-models';
import {
  getAdditionalInfoValidationError,
  getRecordCorrectionReasonsValidationError,
  MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH,
  validateCreateRecordCorrectionRequestFormValues,
} from './validate-form-values';

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request/validate-form-values', () => {
  describe('validateCreateRecordCorrectionRequestFormValues', () => {
    describe('reasons', () => {
      const expectedErrorMessage = 'You must select a reason for the record correction request';

      describe('when reasons is undefined', () => {
        it('should set reasons error', () => {
          // Arrange
          const formValues: CreateRecordCorrectionRequestFormValues = {
            ...aValidSetOfFormValues(),
            reasons: undefined,
          };

          // Act
          const errors = validateCreateRecordCorrectionRequestFormValues(formValues);

          // Assert
          expect(errors.errorSummary).toEqual([{ text: expectedErrorMessage, href: '#reasons' }]);
          expect(errors.reasonsErrorMessage).toEqual(expectedErrorMessage);
        });
      });

      describe('when reasons is an empty array', () => {
        it('should set reasons error', () => {
          // Arrange
          const formValues: CreateRecordCorrectionRequestFormValues = {
            ...aValidSetOfFormValues(),
            reasons: [],
          };

          // Act
          const errors = validateCreateRecordCorrectionRequestFormValues(formValues);

          // Assert
          expect(errors.errorSummary).toEqual([{ text: expectedErrorMessage, href: '#reasons' }]);
          expect(errors.reasonsErrorMessage).toEqual(expectedErrorMessage);
        });
      });

      describe('when reasons is an array of a single valid reason', () => {
        it.each(Object.values(RECORD_CORRECTION_REASON))('should not set reasons error for "%s"', (reason) => {
          // Arrange
          const formValues: CreateRecordCorrectionRequestFormValues = {
            ...aValidSetOfFormValues(),
            reasons: [reason],
          };

          // Act
          const errors = validateCreateRecordCorrectionRequestFormValues(formValues);

          // Assert
          expect(errors.errorSummary).toHaveLength(0);
          expect(errors.reasonsErrorMessage).toBeUndefined();
        });
      });

      describe('when reasons is an array of multiple valid reasons', () => {
        it('should not set reasons error', () => {
          // Arrange
          const formValues: CreateRecordCorrectionRequestFormValues = {
            ...aValidSetOfFormValues(),
            reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
          };

          // Act
          const errors = validateCreateRecordCorrectionRequestFormValues(formValues);

          // Assert
          expect(errors.errorSummary).toHaveLength(0);
          expect(errors.reasonsErrorMessage).toBeUndefined();
        });
      });
    });

    describe('additional info', () => {
      describe('when additional info is undefined', () => {
        it('should set additional info error', () => {
          // Arrange
          const formValues: CreateRecordCorrectionRequestFormValues = {
            ...aValidSetOfFormValues(),
            additionalInfo: undefined,
          };
          const expectedErrorMessage = 'You must provide more information for the record correction request';

          // Act
          const errors = validateCreateRecordCorrectionRequestFormValues(formValues);

          // Assert
          expect(errors.errorSummary).toEqual([{ text: expectedErrorMessage, href: '#additionalInfo' }]);
          expect(errors.additionalInfoErrorMessage).toEqual(expectedErrorMessage);
        });
      });

      describe(`when additional info is more than 0 and less than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH} characters`, () => {
        it('should not set additional info error', () => {
          // Arrange
          const formValues: CreateRecordCorrectionRequestFormValues = {
            ...aValidSetOfFormValues(),
            additionalInfo: 'a'.repeat(450),
          };

          // Act
          const errors = validateCreateRecordCorrectionRequestFormValues(formValues);

          // Assert
          expect(errors.errorSummary).toHaveLength(0);
          expect(errors.additionalInfoErrorMessage).toBeUndefined();
        });
      });

      describe(`when additional info is more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH} characters`, () => {
        it('should set additional info error ', () => {
          // Arrange
          const formValues: CreateRecordCorrectionRequestFormValues = {
            ...aValidSetOfFormValues(),
            additionalInfo: 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH + 1),
          };
          const expectedErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH} characters in the provide more information box`;

          // Act
          const errors = validateCreateRecordCorrectionRequestFormValues(formValues);

          // Assert
          expect(errors.errorSummary).toEqual([{ text: expectedErrorMessage, href: '#additionalInfo' }]);
          expect(errors.additionalInfoErrorMessage).toEqual(expectedErrorMessage);
        });
      });
    });

    it('when there are multiple errors should include all errors in error summary', () => {
      // Arrange
      const formValues: CreateRecordCorrectionRequestFormValues = {};

      // Act
      const errors = validateCreateRecordCorrectionRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual(
        expect.arrayContaining([
          { text: 'You must select a reason for the record correction request', href: '#reasons' },
          { text: 'You must provide more information for the record correction request', href: '#additionalInfo' },
        ]),
      );
    });

    function aValidSetOfFormValues(): CreateRecordCorrectionRequestFormValues {
      return {
        reasons: [RECORD_CORRECTION_REASON.OTHER],
        additionalInfo: 'Some additional info',
      };
    }
  });

  describe('getRecordCorrectionReasonsValidationError', () => {
    describe('when reasons is undefined', () => {
      it('should return "select a reason" error message', () => {
        // Arrange
        const reasons = undefined;

        // Act
        const errorMessage = getRecordCorrectionReasonsValidationError(reasons);

        // Assert
        expect(errorMessage).toEqual('You must select a reason for the record correction request');
      });
    });

    describe('when reasons is an empty array', () => {
      it('should return "select a reason" error message', () => {
        // Arrange
        const reasons: RecordCorrectionReason[] = [];

        // Act
        const errorMessage = getRecordCorrectionReasonsValidationError(reasons);

        // Assert
        expect(errorMessage).toEqual('You must select a reason for the record correction request');
      });
    });

    describe(`when reasons is a non-empty array`, () => {
      it('should return undefined', () => {
        // Arrange
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        // Act
        const errorMessage = getRecordCorrectionReasonsValidationError(reasons);

        // Assert
        expect(errorMessage).toBeUndefined();
      });
    });
  });

  describe('getAdditionalInfoValidationError', () => {
    describe('when the additional info is undefined', () => {
      it('should return "provide more information" error message', () => {
        // Arrange
        const additionalInfo = undefined;

        // Act
        const errorMessage = getAdditionalInfoValidationError(additionalInfo);

        // Assert
        expect(errorMessage).toEqual('You must provide more information for the record correction request');
      });
    });

    describe('when the additional info is an empty string', () => {
      it('should return "provide more information" error message', () => {
        // Arrange
        const additionalInfo = '';

        // Act
        const errorMessage = getAdditionalInfoValidationError(additionalInfo);

        // Assert
        expect(errorMessage).toEqual('You must provide more information for the record correction request');
      });
    });

    describe(`when the additional info input is exactly ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH} characters`, () => {
      it('should return undefined', () => {
        // Arrange
        const additionalInfo = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH);

        // Act
        const errorMessage = getAdditionalInfoValidationError(additionalInfo);

        // Assert
        expect(errorMessage).toBeUndefined();
      });
    });

    describe(`when the additional info input is more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH} characters`, () => {
      it('should return "character limit" error message', () => {
        // Arrange
        const additionalInfo = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH + 1);

        // Act
        const errorMessage = getAdditionalInfoValidationError(additionalInfo);

        // Assert
        expect(errorMessage).toEqual(
          `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH} characters in the provide more information box`,
        );
      });
    });
  });
});
