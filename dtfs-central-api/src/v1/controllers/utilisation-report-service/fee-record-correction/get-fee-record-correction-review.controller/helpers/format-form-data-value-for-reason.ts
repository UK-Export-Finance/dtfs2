import { getFormattedMonetaryValue, RECORD_CORRECTION_REASON, RecordCorrectionReason, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { validateRequiredCorrectionField } from '../../../../../../helpers';

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
      validateRequiredCorrectionField(formData.facilityId, reason);

      return formData.facilityId;
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      validateRequiredCorrectionField(formData.reportedCurrency, reason);

      return formData.reportedCurrency;
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      validateRequiredCorrectionField(formData.reportedFee, reason);

      return getFormattedMonetaryValue(formData.reportedFee);
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      validateRequiredCorrectionField(formData.utilisation, reason);

      return getFormattedMonetaryValue(formData.utilisation);
    case RECORD_CORRECTION_REASON.OTHER:
      validateRequiredCorrectionField(formData.additionalComments, reason);

      return '-';
    default:
      throw new Error(`Unsupported record correction reason: ${reason}`);
  }
};
