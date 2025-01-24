import { getFormattedMonetaryValue, RECORD_CORRECTION_REASON, RecordCorrectionReason, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';

/**
 * Validates that a required form data field has a value.
 * Zero (0) is considered a valid value and will not throw an error.
 * @param value - The value to validate
 * @param reason - The correction reason associated with the field
 * @throws Error if the value is undefined or null
 */
export function validateRequiredFormDataField<T>(value: T | undefined | null, reason: RecordCorrectionReason): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`Required field is missing from transient form data for correction reason: ${reason}`);
  }
}

/**
 * Gets the formatted value from form data for a specific correction reason.
 * @param formData - The transient form data containing corrected values
 * @param reason - The reason for the correction
 * @returns The formatted value corresponding to the correction reason
 * @throws Error if the correction reason is not supported
 */
export const getFormattedFormDataValueForCorrectionReason = (formData: RecordCorrectionTransientFormData, reason: RecordCorrectionReason): string => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      validateRequiredFormDataField(formData.facilityId, reason);

      return formData.facilityId;
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      validateRequiredFormDataField(formData.reportedCurrency, reason);

      return formData.reportedCurrency;
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      validateRequiredFormDataField(formData.reportedFee, reason);

      return getFormattedMonetaryValue(formData.reportedFee);
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      validateRequiredFormDataField(formData.utilisation, reason);

      return getFormattedMonetaryValue(formData.utilisation);
    case RECORD_CORRECTION_REASON.OTHER:
      validateRequiredFormDataField(formData.additionalComments, reason);

      return '-';
    default:
      throw new Error(`Unsupported record correction reason: ${reason}`);
  }
};
