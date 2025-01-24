import { RecordCorrectionReason, RecordCorrectionFormValues, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';

/**
 * Maps record correction reasons to their corresponding form field keys.
 * This mapping is used to associate each {@link RecordCorrectionReason} with
 * the appropriate form field in the {@link RecordCorrectionFormValues}
 * interface.
 */
const correctionReasonToFormKeyMap: Record<RecordCorrectionReason, keyof RecordCorrectionFormValues> = {
  [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]: 'facilityId',
  [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT]: 'reportedCurrency',
  [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]: 'reportedFee',
  [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]: 'utilisation',
  [RECORD_CORRECTION_REASON.OTHER]: 'additionalComments',
};

/**
 * Gets the form field key associated with a specific record correction reason.
 * @param reason - The record correction reason to get the form field key for.
 * @returns The form field key corresponding to the specified reason.
 * @throws Error if an invalid record correction reason is provided.
 */
export const getFormKeyForReason = (reason: RecordCorrectionReason): keyof RecordCorrectionFormValues => {
  if (!(reason in correctionReasonToFormKeyMap)) {
    throw new Error(`Invalid record correction reason: ${reason}`);
  }

  return correctionReasonToFormKeyMap[reason];
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
