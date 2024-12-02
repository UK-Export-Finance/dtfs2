import { MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT, RecordCorrectionTransientFormData, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestFormValues, CreateRecordCorrectionRequestErrorsViewModel, ErrorSummaryViewModel } from '../../../../types/view-models';

/** Represents validation response with either errors or validated form values */
type ValidationResponse =
  | {
      errors: CreateRecordCorrectionRequestErrorsViewModel;
      validatedFormValues: null;
    }
  | {
      errors: null;
      validatedFormValues: RecordCorrectionTransientFormData;
    };

/**
 * Validates the reasons field for a record correction request.
 * @param reasons - The record correction reasons to validate.
 * @returns An error message if validation fails, undefined otherwise.
 */
export const getRecordCorrectionReasonsValidationError = (reasons?: RecordCorrectionReason[]): string | undefined => {
  if (!reasons || reasons?.length === 0) {
    return 'You must select a reason for the record correction request';
  }

  return undefined;
};

/**
 * Validates the additional information field for a record correction request.
 * @param additionalInfo - The additional information text to validate.
 * @returns An error message if validation fails, undefined otherwise.
 */
export const getAdditionalInfoValidationError = (additionalInfo?: string): string | undefined => {
  if (!additionalInfo) {
    return 'You must provide more information for the record correction request';
  }

  if (additionalInfo.length > MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT) {
    return `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the provide more information box`;
  }

  return undefined;
};

/**
 * Gets validation errors for the record correction request form values.
 * @param formValues - The form values to validate.
 * @returns An object containing field-specific validation error messages and an error summary array.
 */
export const getCreateRecordCorrectionRequestFormErrors = ({
  reasons,
  additionalInfo,
}: CreateRecordCorrectionRequestFormValues): CreateRecordCorrectionRequestErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const reasonsErrorMessage = getRecordCorrectionReasonsValidationError(reasons);
  if (reasonsErrorMessage) {
    errorSummary.push({ text: reasonsErrorMessage, href: '#reasons' });
  }

  const additionalInfoErrorMessage = getAdditionalInfoValidationError(additionalInfo);
  if (additionalInfoErrorMessage) {
    errorSummary.push({ text: additionalInfoErrorMessage, href: '#additionalInfo' });
  }

  return {
    reasonsErrorMessage,
    additionalInfoErrorMessage,
    errorSummary,
  };
};

/**
 * Validates the form submission for creating a record correction request.
 * @param formValues - The form values to validate.
 * @returns A ValidationResponse object containing either validation errors or validated form values.
 */
export const validateCreateRecordCorrectionRequestFormValues = ({ reasons, additionalInfo }: CreateRecordCorrectionRequestFormValues): ValidationResponse => {
  const errors = getCreateRecordCorrectionRequestFormErrors({ reasons, additionalInfo });

  if (errors.errorSummary.length > 0) {
    return {
      errors,
      validatedFormValues: null,
    };
  }

  if (!reasons || !additionalInfo) {
    throw new Error('Unexpected error: validation passed but required form values are missing');
  }

  return {
    errors: null,
    validatedFormValues: {
      reasons,
      additionalInfo,
    },
  };
};
