import {
  InvalidPayloadError,
  RECORD_CORRECTION_REASON,
  RecordCorrectionFormValues,
  RecordCorrectionFormValueValidationErrors,
  RecordCorrectionReason,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import {
  getAdditionalCommentsValidationError,
  getFacilityIdValidationError,
  getReportedCurrencyValidationError,
  getReportedFeeValidationError,
  getUtilisationValidationError,
} from './get-record-correction-transient-form-validation-error';

/**
 * Gets the form field key associated with a specific record correction reason.
 * @param reason - The record correction reason to get the form field key for.
 * @returns The form field key corresponding to the specified reason.
 * @throws Error if an invalid record correction reason is provided.
 */
export const getFormKeyForReason = (reason: RecordCorrectionReason): keyof RecordCorrectionFormValues => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      return 'facilityId';
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      return 'reportedCurrency';
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      return 'reportedFee';
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      return 'utilisation';
    case RECORD_CORRECTION_REASON.OTHER:
      return 'additionalComments';
    default:
      throw new Error(`Invalid record correction reason: ${reason}`);
  }
};
/**
 * Gets the form value associated with a specific record correction reason.
 * @param formValues - The form values containing the correction data.
 * @param reason - The record correction reason to get the form value for.
 * @returns The form value for the specified reason, or undefined if no value exists.
 * @throws Error if an invalid record correction reason is provided.
 */
export const getFormValueForReason = (formValues: RecordCorrectionFormValues, reason: RecordCorrectionReason): string | undefined => {
  const reasonKey = getFormKeyForReason(reason);

  return formValues[reasonKey];
};

/**
 * Array of form field keys that can be validated against correction reasons.
 *
 * Note that the "additionalComments" field is excluded as it can be provided
 * regardless of the correction reasons.
 */
const formFieldKeysWithoutAdditionalComments: (keyof RecordCorrectionFormValues)[] = ['utilisation', 'facilityId', 'reportedCurrency', 'reportedFee'];

/**
 * Validates that there are no form values provided for reasons that are not
 * in the correction request.
 *
 * Note that the "additionalComments" field is excluded as it can be provided
 * regardless of the correction reasons.
 * @param formValues - The form values to validate.
 * @param reasons - The reasons for the record correction that determine which form values are expected.
 * @throws InvalidPayloadError if there are any form values provided for reasons not in the correction request.
 */
export const validateNoUnexpectedFormValues = (formValues: RecordCorrectionFormValues, reasons: RecordCorrectionReason[]) => {
  const requiredFormFieldKeys = reasons.map((reason) => getFormKeyForReason(reason));
  const unexpectedFormFieldKeys = difference(formFieldKeysWithoutAdditionalComments, requiredFormFieldKeys);

  unexpectedFormFieldKeys.forEach((formFieldKey) => {
    const formFieldValue = formValues[formFieldKey];

    if (formFieldValue) {
      throw new InvalidPayloadError(
        `Expected form field "${formFieldKey}" to be undefined as it does not have an associated reason in the correction request.`,
      );
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
 * Creates a map of validation functions for each record correction reason.
 * @param reasons - Array of record correction reasons that determine validation rules
 * @returns A ValidatorMap object containing validation functions for each record correction reason type
 */
const getValidatorMap = (reasons: RecordCorrectionReason[]): ValidatorMap => {
  const facilityIdValidator = async (value?: string) => ({ facilityIdErrorMessage: await getFacilityIdValidationError(value) });

  const reportedCurrencyValidator = (value?: string) => ({ reportedCurrencyErrorMessage: getReportedCurrencyValidationError(value) });

  const reportedFeeValidator = (value?: string) => ({ reportedFeeErrorMessage: getReportedFeeValidationError(value) });

  const utilisationValidator = (value?: string) => ({ utilisationErrorMessage: getUtilisationValidationError(value) });

  const otherReasonValidator = (value?: string) => ({ additionalCommentsErrorMessage: getAdditionalCommentsValidationError(reasons, value) });

  return {
    [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]: facilityIdValidator,
    [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT]: reportedCurrencyValidator,
    [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]: reportedFeeValidator,
    [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]: utilisationValidator,
    [RECORD_CORRECTION_REASON.OTHER]: otherReasonValidator,
  };
};

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
  const validatorMap = getValidatorMap(reasons);

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
  validateNoUnexpectedFormValues(formValues, reasons);

  const errors = await getValidationErrorsForRequiredFormValues(formValues, reasons);

  const formHasErrors = hasValidationErrors(errors);

  return {
    formHasErrors,
    errors,
  };
};
