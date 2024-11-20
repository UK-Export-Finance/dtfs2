import { RecordCorrectionRequestReason } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestFormValues, CreateRecordCorrectionRequestErrorsViewModel, ErrorSummaryViewModel } from '../../../../types/view-models';

/**
 * Validates the additional information field for a record correction request.
 * @param additionalInfo - The additional information text to validate.
 * @returns An error message if validation fails, undefined otherwise.
 */
const getAdditionalInfoValidationErrors = (additionalInfo: string | undefined): string | undefined => {
  if (!additionalInfo) {
    return 'You must provide more information for the record correction request';
  }

  if (additionalInfo.length > 500) {
    return 'You cannot enter more than 500 characters in the provide more information box';
  }

  return undefined;
};

/**
 * Validates the form submission for creating a record correction request.
 * @param formValues - The form values to validate.
 * @param checkedReasons - Array of checked record correction request reasons.
 * @returns An object containing an error summary and individual validation error messages (if applicable).
 */
export const validateCreateRecordCorrectionRequest = (
  formValues: CreateRecordCorrectionRequestFormValues,
  checkedReasons: RecordCorrectionRequestReason[],
): CreateRecordCorrectionRequestErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const reasonsErrorMessage = !checkedReasons ? 'You must select a reason for the record correction request' : undefined;
  if (reasonsErrorMessage) {
    errorSummary.push({ text: reasonsErrorMessage, href: '#reasons' });
  }

  const additionalInfoErrorMessage = getAdditionalInfoValidationErrors(formValues.additionalInfo);
  if (additionalInfoErrorMessage) {
    errorSummary.push({ text: additionalInfoErrorMessage, href: '#additionalInfo' });
  }

  return {
    errorSummary,
    reasonsErrorMessage,
    additionalInfoErrorMessage,
  };
};
