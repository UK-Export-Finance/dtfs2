import { MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestFormValues } from '../../../../types/view-models';
import * as validateFormValues from './validate-form-values';

const { getAdditionalInfoValidationError, getCreateRecordCorrectionRequestFormErrors, validateCreateRecordCorrectionRequestFormValues } = validateFormValues;

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request/validate-form-values', () => {
  describe('validateCreateRecordCorrectionRequestFormValues', () => {
    describe('when there are errors with the form values', () => {
      it('should return the errors', () => {
        // Arrange
        const formValues: CreateRecordCorrectionRequestFormValues = {};
        const expectedReasonsErrorMessage = 'You must select a reason for the record correction request';
        const expectedAdditionalInfoErrorMessage = 'You must provide more information for the record correction request';

        // Act
        const { errors } = validateCreateRecordCorrectionRequestFormValues(formValues);

        // Assert
        expect(errors).toEqual({
          errorSummary: [
            { text: expectedReasonsErrorMessage, href: '#reasons' },
            { text: expectedAdditionalInfoErrorMessage, href: '#additionalInfo' },
          ],
          additionalInfoErrorMessage: expectedAdditionalInfoErrorMessage,
          reasonsErrorMessage: expectedReasonsErrorMessage,
        });
      });

      it('should not return any validated form values', () => {
        // Arrange
        const formValues: CreateRecordCorrectionRequestFormValues = {};

        // Act
        const { validatedFormValues } = validateCreateRecordCorrectionRequestFormValues(formValues);

        // Assert
        expect(validatedFormValues).toBeNull();
      });
    });

    describe('when there are no errors with the form values and all expected form values are present', () => {
      it('should return the validated form values', () => {
        // Arrange
        const formValues = aValidSetOfFormValues();

        // Act
        const { validatedFormValues } = validateCreateRecordCorrectionRequestFormValues(formValues);

        // Assert
        expect(validatedFormValues).toEqual({
          additionalInfo: formValues.additionalInfo,
          reasons: formValues.reasons,
        });
      });

      it('should not return any errors', () => {
        // Arrange
        const formValues = aValidSetOfFormValues();

        // Act
        const { errors } = validateCreateRecordCorrectionRequestFormValues(formValues);

        // Assert
        expect(errors).toBeNull();
      });
    });

    describe('when there are no errors with the form values but not all expected form values are present', () => {
      it('should throw an error', () => {
        // Arrange
        const getFormErrorsSpy = jest.spyOn(validateFormValues, 'getCreateRecordCorrectionRequestFormErrors');
        getFormErrorsSpy.mockReturnValue({
          errorSummary: [],
        });

        const formValues: CreateRecordCorrectionRequestFormValues = {
          reasons: undefined,
          additionalInfo: undefined,
        };

        // Act and Assert
        expect(() => validateCreateRecordCorrectionRequestFormValues(formValues)).toThrow(
          'Unexpected error: validation passed but required form values are missing',
        );
      });
    });
  });

  describe('getCreateRecordCorrectionRequestFormErrors', () => {
    describe('when reasons is undefined', () => {
      it('should set reasons error', () => {
        // Arrange
        const expectedErrorMessage = 'You must select a reason for the record correction request';
        const formValues: CreateRecordCorrectionRequestFormValues = {
          ...aValidSetOfFormValues(),
          reasons: undefined,
        };

        // Act
        const errors = getCreateRecordCorrectionRequestFormErrors(formValues);

        // Assert
        expect(errors).toEqual({
          errorSummary: [{ text: expectedErrorMessage, href: '#reasons' }],
          reasonsErrorMessage: expectedErrorMessage,
        });
      });
    });

    describe('when reasons is an empty array', () => {
      it('should set reasons error', () => {
        // Arrange
        const expectedErrorMessage = 'You must select a reason for the record correction request';
        const formValues: CreateRecordCorrectionRequestFormValues = {
          ...aValidSetOfFormValues(),
          reasons: [],
        };

        // Act
        const errors = getCreateRecordCorrectionRequestFormErrors(formValues);

        // Assert
        expect(errors).toEqual({
          errorSummary: [{ text: expectedErrorMessage, href: '#reasons' }],
          reasonsErrorMessage: expectedErrorMessage,
        });
      });
    });

    describe('when reasons is an array of a single valid reason', () => {
      it.each(Object.values(RECORD_CORRECTION_REASON))('should not set any errors for reason "%s"', (reason) => {
        // Arrange
        const formValues: CreateRecordCorrectionRequestFormValues = {
          ...aValidSetOfFormValues(),
          reasons: [reason],
        };

        // Act
        const errors = getCreateRecordCorrectionRequestFormErrors(formValues);

        // Assert
        expect(errors).toEqual({
          errorSummary: [],
        });
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
        const errors = getCreateRecordCorrectionRequestFormErrors(formValues);

        // Assert
        expect(errors).toEqual({
          errorSummary: [],
        });
      });
    });

    describe('when additional info is undefined', () => {
      it('should set additional info error', () => {
        // Arrange
        const expectedErrorMessage = 'You must provide more information for the record correction request';
        const formValues: CreateRecordCorrectionRequestFormValues = {
          ...aValidSetOfFormValues(),
          additionalInfo: undefined,
        };

        // Act
        const errors = getCreateRecordCorrectionRequestFormErrors(formValues);

        // Assert
        expect(errors).toEqual({
          errorSummary: [{ text: expectedErrorMessage, href: '#additionalInfo' }],
          additionalInfoErrorMessage: expectedErrorMessage,
        });
      });
    });

    describe(`when additional info is more than 0 and less than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters`, () => {
      it('should not set additional info error', () => {
        // Arrange
        const formValues: CreateRecordCorrectionRequestFormValues = {
          ...aValidSetOfFormValues(),
          additionalInfo: 'a'.repeat(450),
        };

        // Act
        const errors = getCreateRecordCorrectionRequestFormErrors(formValues);

        // Assert
        expect(errors).toEqual({
          errorSummary: [],
        });
      });
    });

    describe(`when additional info is more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters`, () => {
      it('should set additional info error ', () => {
        // Arrange
        const expectedErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the provide more information box`;
        const formValues: CreateRecordCorrectionRequestFormValues = {
          ...aValidSetOfFormValues(),
          additionalInfo: 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1),
        };

        // Act
        const errors = getCreateRecordCorrectionRequestFormErrors(formValues);

        // Assert
        expect(errors).toEqual({
          errorSummary: [{ text: expectedErrorMessage, href: '#additionalInfo' }],
          additionalInfoErrorMessage: expectedErrorMessage,
        });
      });
    });

    it('when there are multiple errors should include all errors in the error response', () => {
      // Arrange
      const formValues: CreateRecordCorrectionRequestFormValues = {};
      const expectedReasonsErrorMessage = 'You must select a reason for the record correction request';
      const expectedAdditionalInfoErrorMessage = 'You must provide more information for the record correction request';

      // Act
      const errors = getCreateRecordCorrectionRequestFormErrors(formValues);

      // Assert
      expect(errors).toEqual({
        errorSummary: [
          { text: expectedReasonsErrorMessage, href: '#reasons' },
          { text: expectedAdditionalInfoErrorMessage, href: '#additionalInfo' },
        ],
        additionalInfoErrorMessage: expectedAdditionalInfoErrorMessage,
        reasonsErrorMessage: expectedReasonsErrorMessage,
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

    describe(`when the additional info input is exactly ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters`, () => {
      it('should return undefined', () => {
        // Arrange
        const additionalInfo = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT);

        // Act
        const errorMessage = getAdditionalInfoValidationError(additionalInfo);

        // Assert
        expect(errorMessage).toBeUndefined();
      });
    });

    describe(`when the additional info input is more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters`, () => {
      it('should return "character limit" error message', () => {
        // Arrange
        const additionalInfo = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1);

        // Act
        const errorMessage = getAdditionalInfoValidationError(additionalInfo);

        // Assert
        expect(errorMessage).toEqual(
          `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the provide more information box`,
        );
      });
    });
  });

  function aValidSetOfFormValues(): CreateRecordCorrectionRequestFormValues {
    return {
      reasons: [RECORD_CORRECTION_REASON.OTHER],
      additionalInfo: 'Some additional info',
    };
  }
});
