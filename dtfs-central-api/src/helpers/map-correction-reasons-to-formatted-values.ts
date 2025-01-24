import {
  FeeRecordCorrectionEntity,
  RecordCorrectionValues,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
  getFormattedMonetaryValue,
} from '@ukef/dtfs2-common';

/**
 * returns the value of the provided correction values that corresponds to the reason
 * or '-' if the reason is RECORD_CORRECTION_REASON.OTHER
 * @param correctedValues - the previousValues or correctedValues
 * @param reason - the reason for the correction
 * @returns - string with the value of the previous or corrected values that corresponds to the reason
 */
export const getFormattedCorrectValueForCorrectionReason = (correctedValues: RecordCorrectionValues, reason: RecordCorrectionReason) => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      return correctedValues.facilityId;
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      return correctedValues.feesPaidToUkefForThePeriodCurrency;
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      return getFormattedMonetaryValue(Number(correctedValues.feesPaidToUkefForThePeriod));
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      return getFormattedMonetaryValue(Number(correctedValues.facilityUtilisation));
    default:
      return '-';
  }
};

/**
 * maps through an array of reasons for the correct values
 * returns an array of the values of each correctedValues property that corresponds to each reason
 * in the same order as the reasons array
 * @param correction - the correctedValues
 * @param reasons - the reasons for the correction
 * @returns an array of the values of each correctedValues property that corresponds to each reason
 */
export const mapCorrectionReasonsToFormattedCorrectValues = (correction: FeeRecordCorrectionEntity, reasons: RecordCorrectionReason[]) => {
  return reasons.map((reason) => getFormattedCorrectValueForCorrectionReason(correction.correctedValues, reason));
};

/**
 * maps through an array of reasons for the previous values
 * returns an array of the values of each previousValues property that corresponds to each reason
 * in the same order as the reasons array
 * @param correction - the previousValues
 * @param reasons - the reasons for the correction
 * @returns an array of the values of each previousValues property that corresponds to each reason
 */
export const mapCorrectionReasonsToFormattedPreviousValues = (correction: FeeRecordCorrectionEntity, reasons: RecordCorrectionReason[]) => {
  return reasons.map((reason) => getFormattedCorrectValueForCorrectionReason(correction.previousValues, reason));
};
