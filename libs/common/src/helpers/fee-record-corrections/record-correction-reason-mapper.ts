import { RECORD_CORRECTION_REASON } from '../../constants';
import { RecordCorrectionReason } from '../../types';

/**
 * Maps a record correction reason to a display value
 * @param reason - the record correction reason
 * @returns the display value for the record correction reason
 */
export const mapReasonToDisplayValue = (reason: RecordCorrectionReason) => {
  switch (reason) {
    case RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT:
      return 'Facility ID is incorrect';
    case RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT:
      return 'Reported currency is incorrect';
    case RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT:
      return 'Reported fee is incorrect';
    case RECORD_CORRECTION_REASON.UTILISATION_INCORRECT:
      return 'Utilisation is incorrect';
    case RECORD_CORRECTION_REASON.OTHER:
      return 'Other';
    default:
      throw new Error(`Invalid record correction reason: ${reason}`);
  }
};

/**
 * Maps record correction reasons to display values
 * @param reasons - the record correction reasons
 * @returns the display values for the record correction reasons
 */
export const mapReasonsToDisplayValues = (reasons: RecordCorrectionReason[]) => {
  return reasons.map((reason) => mapReasonToDisplayValue(reason));
};
