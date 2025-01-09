import {
  FeeRecordCorrectionEntity,
  FeeRecordCorrectionReviewInformation,
  getFormattedMonetaryValue,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
  RecordCorrectionTransientFormData,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { mapCorrectionReasonsToFormattedOldValues } from '../../../../../helpers/map-correction-reasons-to-incorrect-values';

// TODO: Add unit tests
/**
 * Gets the formatted value from form data for a specific correction reason.
 * @param formData - The transient form data containing corrected values
 * @param reason - The reason for the correction
 * @returns The formatted value corresponding to the correction reason
 * @throws Error if the correction reason is not supported
 */
const getFormattedFormDataValueForCorrectionReason = (formData: RecordCorrectionTransientFormData, reason: RecordCorrectionReason) => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      return formData.facilityId;
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      return formData.reportedCurrency;
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      return getFormattedMonetaryValue(formData.reportedFee!);
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      return getFormattedMonetaryValue(formData.utilisation!);
    default:
      throw new Error(`Unsupported record correction reason: ${reason}`);
  }
};

// TODO: Add unit tests
/**
 * Maps through an array of correction reasons and returns an array of
 * formatted values from the transient form data.
 *
 * {@link RECORD_CORRECTION_REASON.OTHER} is excluded from the returned array.
 * @param formData - The transient form data containing corrected values
 * @param reasons - Array of reasons for the correction
 * @returns Array of formatted values from the form data, corresponding to each correction reason
 */
export const mapFormDataToFormattedValues = (formData: RecordCorrectionTransientFormData, reasons: RecordCorrectionReason[]) => {
  const reasonsWithoutOther = difference(reasons, [RECORD_CORRECTION_REASON.OTHER]);

  return reasonsWithoutOther.map((reason) => getFormattedFormDataValueForCorrectionReason(formData, reason));
};

// TODO: Add unit tests
// TODO: Add TSDOC
export const mapToReviewInformation = (
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
