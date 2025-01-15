import {
  isCurrencyValid,
  isMonetaryAmountValid,
  MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT,
  RECORD_CORRECTION_REASON,
  RecordCorrectionFormValues,
  RecordCorrectionFormValueValidationErrors,
  RecordCorrectionReason,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { UKEF_FACILITY_ID_REGEX } from '../../../../../../constants/regex';
import { TfmFacilitiesRepo } from '../../../../../../repositories/tfm-facilities-repo';

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

/**
 * Validates a facility ID value.
 * @param facilityIdValue - The facility ID to validate.
 * @returns A promise that resolves to an error message if validation fails, undefined otherwise.
 * The error message will indicate if:
 * - The facility ID is missing or does not match the required format (8-10 digits)
 * - The facility ID does not correspond to an existing General Export Facility
 */
export const getFacilityIdValidationError = async (facilityIdValue?: string): Promise<string | undefined> => {
  if (!facilityIdValue || !UKEF_FACILITY_ID_REGEX.test(facilityIdValue)) {
    return 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';
  }

  const ukefGefFacilityExists = await TfmFacilitiesRepo.ukefGefFacilityExists(facilityIdValue);

  if (!ukefGefFacilityExists) {
    return 'The facility ID entered has not been recognised, please enter a facility ID for a General Export Facility';
  }

  return undefined;
};

/**
 * Validates the additional comments field for a record correction request.
 *
 * If the character count exceeds the maximum allowed character count, the
 * input field referenced in the error message is matched to the fields label.
 *
 * @param correctionReasons - The reasons for the record correction request.
 * @param additionalComments - The additional comments text to validate.
 * @returns An error message if validation fails, undefined otherwise.
 */
export const getAdditionalCommentsValidationError = (correctionReasons: RecordCorrectionReason[], additionalComments?: string): string | undefined => {
  if (!additionalComments) {
    return 'You must enter a comment';
  }

  if (additionalComments.length < MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT) {
    return undefined;
  }

  const baseCharacterLimitExceededErrorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the`;

  if (correctionReasons.length === 1) {
    return `${baseCharacterLimitExceededErrorMessage} record information box`;
  }

  return `${baseCharacterLimitExceededErrorMessage} additional comments box`;
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
