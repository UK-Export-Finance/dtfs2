import { RecordCorrectionFormValues, RecordCorrectionFormValueValidationErrors, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { validateNoUnexpectedFormValues } from './validate-no-unexpected-record-correction-transient-form-values';
import { getValidationErrorsForFormValues } from './get-record-correction-transient-form-required-field-validation-errors';

/**
 * Checks if there are any validation errors present in the validation errors object.
 *
 * Iterates through all values in the errors object and checks if any are defined.
 * Since some error properties may be explicitly set to undefined, we need to check
 * for defined values rather than just truthy values or object key presence.
 * @param validationErrors - Object containing validation error messages for form values
 * @returns True if any validation error messages exist, false otherwise
 */
export const hasValidationErrors = (validationErrors: RecordCorrectionFormValueValidationErrors): boolean =>
  Object.values(validationErrors).some((error) => error !== undefined);

/**
 * Validates the form values for a record correction request
 * @param formValues - The form values to validate
 * @param reasons - The reasons for the record correction
 * @returns Promise that resolves to validation errors for the individual form values, if any
 */
export const validateRecordCorrectionTransientFormValues = async (
  formValues: RecordCorrectionFormValues,
  reasons: RecordCorrectionReason[],
): Promise<{ formHasErrors: boolean; errors: RecordCorrectionFormValueValidationErrors }> => {
  validateNoUnexpectedFormValues(formValues, reasons);

  const errors = await getValidationErrorsForFormValues(formValues, reasons);

  const formHasErrors = hasValidationErrors(errors);

  return {
    formHasErrors,
    errors,
  };
};
