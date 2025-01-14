import { FeeRecordEntity, RECORD_CORRECTION_REASON, RecordCorrectionReason, getFormattedMonetaryValue } from '@ukef/dtfs2-common';

/**
 * returns the value of the fee record property that corresponds to the reason
 * or '-' if the reason is RECORD_CORRECTION_REASON.OTHER
 * @param feeRecord - the fee record
 * @param reason - the reason for the correction
 * @returns - string with the value of the fee record property that corresponds to the reason
 */
export const getFormattedOldValueForCorrectionReason = (feeRecord: FeeRecordEntity, reason: RecordCorrectionReason) => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      return feeRecord.facilityId;
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      return feeRecord.feesPaidToUkefForThePeriodCurrency;
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      return getFormattedMonetaryValue(feeRecord.feesPaidToUkefForThePeriod);
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      return getFormattedMonetaryValue(feeRecord.facilityUtilisation);
    default:
      return '-';
  }
};

/**
 * maps through an array of reasons
 * returns an array of the values of each fee record property that corresponds to each reason
 * in the same order as the reasons array
 * @param feeRecord - the fee record
 * @param reasons - the reasons for the correction
 * @returns an array of the values of each fee record property that corresponds to each reason
 */
export const mapCorrectionReasonsToFormattedOldValues = (feeRecord: FeeRecordEntity, reasons: RecordCorrectionReason[]) => {
  return reasons.map((reason) => getFormattedOldValueForCorrectionReason(feeRecord, reason));
};
