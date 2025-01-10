import {
  FeeRecordCorrectionEntity,
  FeeRecordCorrectionReviewInformation,
  getFormattedMonetaryValue,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
  RecordCorrectionTransientFormData,
} from '@ukef/dtfs2-common';
import { mapCorrectionReasonsToFormattedOldValues } from '../../../../../helpers/map-correction-reasons-to-formatted-values';

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
export const getFormattedFormDataValueForCorrectionReason = (formData: RecordCorrectionTransientFormData, reason: RecordCorrectionReason) => {
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
      return '-';
    default:
      throw new Error(`Unsupported record correction reason: ${reason}`);
  }
};

/**
 * Maps through an array of correction reasons and returns an array of
 * formatted values from the transient form data.
 * @param formData - The transient form data containing corrected values
 * @param reasons - Array of reasons for the correction
 * @returns Array of formatted values from the form data, corresponding to each correction reason
 */
export const mapFormDataToFormattedValues = (formData: RecordCorrectionTransientFormData, reasons: RecordCorrectionReason[]) => {
  return reasons.map((reason) => getFormattedFormDataValueForCorrectionReason(formData, reason));
};

/**
 * Maps transient form data and fee record correction entity into review information.
 * @param formData - The transient form data containing the corrected values
 * @param feeRecordCorrection - The fee record correction entity containing original record and correction details
 * @returns Formatted review information
 */
export const mapTransientCorrectionDataToReviewInformation = (
  formData: RecordCorrectionTransientFormData,
  feeRecordCorrection: FeeRecordCorrectionEntity,
): FeeRecordCorrectionReviewInformation => {
  const { id: correctionId, feeRecord, reasons, additionalInfo: errorSummary } = feeRecordCorrection;

  const mappedFeeRecord = {
    exporter: feeRecord.exporter,
    reportedFees: {
      currency: feeRecord.feesPaidToUkefForThePeriodCurrency,
      amount: feeRecord.feesPaidToUkefForThePeriod,
    },
  };

  const formattedOldValues = mapCorrectionReasonsToFormattedOldValues(feeRecord, reasons);
  const formattedNewValues = mapFormDataToFormattedValues(formData, reasons);

  return {
    correctionId,
    feeRecord: mappedFeeRecord,
    reasons,
    errorSummary,
    formattedOldValues: formattedOldValues.join(', '),
    formattedNewValues: formattedNewValues.join(', '),
    bankCommentary: formData.additionalComments,
  };
};
