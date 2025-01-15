import {
  isCurrencyValid,
  isMonetaryAmountValid,
  RECORD_CORRECTION_REASON,
  RecordCorrectionFormValues,
  RecordCorrectionFormValueValidationErrors,
  RecordCorrectionReason,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { getFacilityIdValidationError, getAdditionalCommentsValidationError } from './get-record-correction-transient-form-validation-error';

// TODO: Add unit tests
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

// TODO: Add unit tests
/**
 * Validates that there are no form values provided for reasons that are not in the correction request.
 * @param formValues - The form values to validate.
 * @param reasons - The reasons for the record correction that determine which form values are expected.
 * @throws Error if there are any form values provided for reasons not in the correction request.
 */
export const validateNoUnexpectedReasonValues = (formValues: RecordCorrectionFormValues, reasons: RecordCorrectionReason[]) => {
  const unexpectedReasons = difference(Object.values(RECORD_CORRECTION_REASON), reasons);

  unexpectedReasons.forEach((reason) => {
    const reasonFormValue = getFormValueForReason(formValues, reason);

    if (reasonFormValue) {
      throw new Error(`Unexpected form value "${reasonFormValue}" for reason "${reason}" not in the correction request reasons.`);
    }
  });
};

type ValidationMap = Record<
  RecordCorrectionReason,
  {
    errorKey: keyof RecordCorrectionFormValueValidationErrors;
    validator: (value?: string) => Promise<string | undefined> | string | undefined;
  }
>;

// TODO: Add unit tests
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
  const validationErrors: RecordCorrectionFormValueValidationErrors = {};

  const validationMap: ValidationMap = {
    [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]: {
      errorKey: 'facilityIdErrorMessage',
      validator: getFacilityIdValidationError,
    },
    [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT]: {
      errorKey: 'reportedCurrencyErrorMessage',
      validator: (value?: string) => (isCurrencyValid(value) ? undefined : 'You must select a currency'),
    },
    [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]: {
      errorKey: 'reportedFeeErrorMessage',
      validator: (value?: string) => (isMonetaryAmountValid(value) ? undefined : 'You must enter the reported fee in a valid format'),
    },
    [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]: {
      errorKey: 'utilisationErrorMessage',
      validator: (value?: string) => (isMonetaryAmountValid(value) ? undefined : 'You must enter the utilisation in a valid format'),
    },
    [RECORD_CORRECTION_REASON.OTHER]: {
      errorKey: 'additionalCommentsErrorMessage',
      validator: (value?: string) => getAdditionalCommentsValidationError(reasons, value),
    },
  };

  await Promise.all(
    reasons.map(async (reason) => {
      const validation = validationMap[reason];

      if (!validation) {
        throw new Error(`Invalid record correction reason: ${reason}`);
      }

      const reasonFormValue = getFormValueForReason(formValues, reason);
      validationErrors[validation.errorKey] = await validation.validator(reasonFormValue);
    }),
  );

  return validationErrors;
};

// TODO: Add unit tests
/**
 * Validates the form values for a record correction request
 * @param formValues - The form values to validate
 * @param reasons - The reasons for the record correction
 * @returns Promise that resolves to validation errors for the individual form values, if any
 */
export const validateRecordCorrectionTransientFormValues = async (
  formValues: RecordCorrectionFormValues,
  reasons: RecordCorrectionReason[],
): Promise<RecordCorrectionFormValueValidationErrors> => {
  validateNoUnexpectedReasonValues(formValues, reasons);

  return await getValidationErrorsForRequiredFormValues(formValues, reasons);
};
