import { RecordCorrectionFormValueValidationErrors } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from '../../../../types/view-models/error-summary-view-model';
import { ProvideUtilisationReportCorrectionErrorsViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';

/**
 * Maps form field error keys to their corresponding HTML element IDs for error summary links.
 * Each key corresponds to a validation error message field in the RecordCorrectionFormValueValidationErrors type.
 * The values are the HTML element IDs that the error summary links should point to.
 */
const errorKeyToHrefMap: Record<keyof RecordCorrectionFormValueValidationErrors, string> = {
  facilityIdErrorMessage: '#facilityId',
  reportedCurrencyErrorMessage: '#reportedCurrency',
  reportedFeeErrorMessage: '#reportedFee',
  utilisationErrorMessage: '#utilisation',
  additionalCommentsErrorMessage: '#additionalComments',
};

/**
 * Maps validation errors to a view model for displaying error messages.
 * @param validationErrors - Object containing validation error messages for form values.
 * @returns A view model containing the original validation errors and an error summary array
 * with text and href properties for each error message.
 */
export const mapValidationErrorsToViewModel = (
  validationErrors: RecordCorrectionFormValueValidationErrors,
): ProvideUtilisationReportCorrectionErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const validationErrorKeys = Object.keys(validationErrors) as (keyof RecordCorrectionFormValueValidationErrors)[];

  validationErrorKeys.forEach((key) => {
    const errorMessage = validationErrors[key];

    if (errorMessage) {
      errorSummary.push({
        text: errorMessage,
        href: errorKeyToHrefMap[key],
      });
    }
  });

  return {
    ...validationErrors,
    errorSummary,
  };
};
