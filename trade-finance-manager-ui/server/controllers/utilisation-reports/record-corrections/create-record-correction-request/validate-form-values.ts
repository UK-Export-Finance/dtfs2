import { RecordCorrectionReason } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestFormValues, CreateRecordCorrectionRequestErrorsViewModel, ErrorSummaryViewModel } from '../../../../types/view-models';

/**
 * The maximum length of the additional information field for a record correction request.
 */
export const MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH = 500;

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

  if (additionalInfo.length > MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH) {
    return `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_LENGTH} characters in the provide more information box`;
  }

  return undefined;
};

/**
 * Validates the form submission for creating a record correction request.
 * @param formValues - The form values to validate.
 * @returns An object containing an error summary and individual validation error messages (if applicable).
 */
export const validateCreateRecordCorrectionRequestFormValues = (
  formValues: CreateRecordCorrectionRequestFormValues,
): CreateRecordCorrectionRequestErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const reasonsErrorMessage = getRecordCorrectionReasonsValidationError(formValues.reasons);

  if (reasonsErrorMessage) {
    errorSummary.push({ text: reasonsErrorMessage, href: '#reasons' });
  }

  const additionalInfoErrorMessage = getAdditionalInfoValidationError(formValues.additionalInfo);

  if (additionalInfoErrorMessage) {
    errorSummary.push({ text: additionalInfoErrorMessage, href: '#additionalInfo' });
  }

  return {
    errorSummary,
    reasonsErrorMessage,
    additionalInfoErrorMessage,
  };
};
