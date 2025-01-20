import { RecordCorrectionReason, RecordCorrectionFormValues, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';

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
