import {
  isCurrencyValid,
  isMonetaryAmountValid,
  RECORD_CORRECTION_REASON,
  RecordCorrectionFormValues,
  RecordCorrectionFormValueValidationErrors,
  RecordCorrectionReason,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { getAdditionalCommentsValidationError, getFacilityIdValidationError } from './get-record-correction-transient-form-validation-error';

/**
 * Gets the form value associated with a specific record correction reason.
 * @param formValues - The form values containing the correction data.
 * @param reason - The record correction reason to get the form value for.
 * @returns The form value for the specified reason, or undefined if no value exists.
 * @throws Error if an invalid record correction reason is provided.
 */
export const getFormValueForReason = (formValues: RecordCorrectionFormValues, reason: RecordCorrectionReason): string | undefined => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      return formValues.facilityId;
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      return formValues.reportedCurrency;
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      return formValues.reportedFee;
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      return formValues.utilisation;
    case RECORD_CORRECTION_REASON.OTHER:
      return formValues.additionalComments;
    default:
      throw new Error(`Invalid record correction reason: ${reason}`);
  }
};

/**
 * Validates that there are no form values provided for reasons that are not in the correction request.
 *
 * Note that {@link RECORD_CORRECTION_REASON.OTHER} is always a field (optional if not in the reasons,
 * required if in the reasons) so it is not included in this check.
 * @param formValues - The form values to validate.
 * @param reasons - The reasons for the record correction that determine which form values are expected.
 * @throws Error if there are any form values provided for reasons not in the correction request.
 */
export const validateNoUnexpectedReasonValues = (formValues: RecordCorrectionFormValues, reasons: RecordCorrectionReason[]) => {
  const unexpectedReasons = difference(Object.values(RECORD_CORRECTION_REASON), [...reasons, RECORD_CORRECTION_REASON.OTHER]);

  unexpectedReasons.forEach((reason) => {
    const reasonFormValue = getFormValueForReason(formValues, reason);

    if (reasonFormValue) {
      throw new Error(`Unexpected form value "${reasonFormValue}" for reason "${reason}" not in the correction request reasons.`);
    }
  });
};

/**
 * Defines validation rules for each record correction reason, mapping each reason to a validation function that returns validation errors.
 */
type ValidatorMap = Record<
  RecordCorrectionReason,
  (value?: string) => Promise<Partial<RecordCorrectionFormValueValidationErrors>> | Partial<RecordCorrectionFormValueValidationErrors>
>;

/**
 * Gets validation errors for form values that are required based on the selected reasons.
 * @param formValues - The form values to validate.
 * @param reasons - The reasons for the record correction that determine which form values are required.
 * @returns An object containing validation error messages for any invalid required form values.
 */
export const getValidationErrorsForRequiredFormValues = async (
  formValues: RecordCorrectionFormValues,
  reasons: RecordCorrectionReason[],
): Promise<RecordCorrectionFormValueValidationErrors> => {
  const validatorMap: ValidatorMap = {
    [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]: async (value?: string) => ({ facilityIdErrorMessage: await getFacilityIdValidationError(value) }),
    [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT]: (value?: string) =>
      isCurrencyValid(value) ? {} : { reportedCurrencyErrorMessage: 'You must select a currency' },
    [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]: (value?: string) =>
      isMonetaryAmountValid(value) ? {} : { reportedFeeErrorMessage: 'You must enter the reported fee in a valid format' },
    [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]: (value?: string) =>
      isMonetaryAmountValid(value) ? {} : { utilisationErrorMessage: 'You must enter the utilisation in a valid format' },
    [RECORD_CORRECTION_REASON.OTHER]: (value?: string) => ({ additionalCommentsErrorMessage: getAdditionalCommentsValidationError(reasons, value) }),
  };

  let validationErrors: RecordCorrectionFormValueValidationErrors = {};

  for (const reason of reasons) {
    const reasonValidator = validatorMap[reason];

    if (!reasonValidator) {
      throw new Error(`Invalid record correction reason: ${reason}`);
    }

    const reasonFormValue = getFormValueForReason(formValues, reason);

    const reasonErrors = await reasonValidator(reasonFormValue);

    validationErrors = {
      ...validationErrors,
      ...reasonErrors,
    };
  }

  return validationErrors;
};

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
  validateNoUnexpectedReasonValues(formValues, reasons);

  const errors = await getValidationErrorsForRequiredFormValues(formValues, reasons);

  const formHasErrors = hasValidationErrors(errors);

  return {
    formHasErrors,
    errors,
  };
};
