import { FeeRecordEntity } from '../../sql-db-entities';
import { RECORD_CORRECTION_REASON } from '../../constants';

/**
 * returns the value of the fee record property that corresponds to the reason
 * or '-' if the reason is not recognised such as RECORD_CORRECTION_REASON.OTHER
 * @param feeRecord - the fee record
 * @param reason - the reason for the correction
 * @returns - string with the value of the fee record property that corresponds to the reason
 */
export const correctionReasonsToValues = (feeRecord: FeeRecordEntity, reason: string) => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      return feeRecord.facilityId;
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      return feeRecord.totalFeesAccruedForThePeriodCurrency;
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      return feeRecord.totalFeesAccruedForThePeriod;
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      return feeRecord.facilityUtilisation;
    default:
      return '-';
  }
};

/**
 * maps through an array of reasons
 * returns an array of the values of each fee record property that corresponds to each reason
 * @param feeRecord - the fee record
 * @param reasons - the reasons for the correction
 * @returns an array of the values of each fee record property that corresponds to each reason
 */
export const mapCorrectionReasonsToValues = (feeRecord: FeeRecordEntity, reasons: string[]) => {
  return reasons.map((reason) => correctionReasonsToValues(feeRecord, reason));
};
