import { RecordCorrectionReason, RecordCorrectionFormValueValidationErrors, RECORD_CORRECTION_REASON, RecordCorrectionFormValues } from '@ukef/dtfs2-common';
import { getFormValueForReason } from './extract-record-correction-transient-form-values';
import {
  getFacilityIdValidationError,
  getReportedCurrencyValidationError,
  getReportedFeeValidationError,
  getUtilisationValidationError,
  getAdditionalCommentsValidationError,
} from './get-record-correction-transient-form-validation-error';

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

  const isOtherInReasons = reasons.includes(RECORD_CORRECTION_REASON.OTHER);
  const isOtherSoleCorrectionReason = reasons.length === 1 && isOtherInReasons;

  const otherReasonValidator = (value?: string) => ({
    additionalCommentsErrorMessage: getAdditionalCommentsValidationError(isOtherSoleCorrectionReason, isOtherInReasons, value),
  });

  return {
    [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]: facilityIdValidator,
    [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT]: reportedCurrencyValidator,
    [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]: reportedFeeValidator,
    [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]: utilisationValidator,
    [RECORD_CORRECTION_REASON.OTHER]: otherReasonValidator,
  };
};

/**
 * Gets validation errors for form values.
 *
 * Validates all form values that are required based on the selected reasons.
 *
 * If {@link RECORD_CORRECTION_REASON.OTHER"} is included in the reasons,
 * the "additional comments" field is validated as required. Otherwise,
 * it is validated as optional and does not include a minimum length check.
 * @param formValues - The form values to validate.
 * @param reasons - The reasons for the record correction that determine which form values are required.
 * @returns An object containing validation error messages for any invalid required form values.
 */
export const getValidationErrorsForFormValues = async (
  formValues: RecordCorrectionFormValues,
  reasons: RecordCorrectionReason[],
): Promise<RecordCorrectionFormValueValidationErrors> => {
  const validatorMap = getValidatorMap(reasons);

  let validationErrors: RecordCorrectionFormValueValidationErrors = {};

  const reasonsWithOther = [...reasons, RECORD_CORRECTION_REASON.OTHER];

  for (const reason of reasonsWithOther) {
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
