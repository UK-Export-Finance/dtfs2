import { MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestFormValues, CreateRecordCorrectionRequestErrorsViewModel, ErrorSummaryViewModel } from '../../../../types/view-models';

/**
 * Validates the additional information field for a record correction request.
 * @param additionalInfo - The additional information text to validate.
 * @returns An error message if validation fails, undefined otherwise.
 */
export const getAdditionalInfoValidationError = (additionalInfo: string | undefined): string | undefined => {
  if (!additionalInfo) {
    return 'You must provide more information for the record correction request';
  }

  if (additionalInfo.length > MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT) {
    return `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the provide more information box`;
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

  const reasonsErrorMessage =
    !formValues.reasons || formValues.reasons?.length === 0 ? 'You must select a reason for the record correction request' : undefined;
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
