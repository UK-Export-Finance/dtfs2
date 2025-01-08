import { format } from 'date-fns';
import { FeeRecordEntity, FeeRecordCorrectionSummary, mapReasonsToDisplayValues, FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { mapCorrectionReasonsToFormattedOldValues } from '../../../../../helpers/map-correction-reasons-to-incorrect-values';

/**
 * Retrieves and constructs record correction data for the given fee records.
 * If no record corrections are found at all, an empty array is returned.
 * If any fee records have record corrections, the data is mapped to the correct format and that array of objects is returned.
 * @param feeRecords - The fee records
 * @returns Utilisation data for each fee record
 */
export const getRecordCorrectionDetails = (feeRecords: FeeRecordEntity[]): FeeRecordCorrectionSummary[] => {
  return feeRecords.flatMap((feeRecord) => {
    if (!feeRecord.corrections || feeRecord.corrections.length === 0) {
      return [];
    }

    const { id: feeRecordId, exporter } = feeRecord;

    return feeRecord.corrections.map((correction) => {
      const { id: correctionId, dateRequested } = correction;

      /**
       * maps the reasons array to display the current fee record values as old records
       * constructs a comma seperated string if there are more than one reason
       * the "old records" are the values before being corrected
       */
      const oldRecords = mapCorrectionReasonsToFormattedOldValues(feeRecord, correction.reasons);
      const formattedOldRecords = oldRecords.join(', ');

      /**
       * maps the reasons as an array of strings to display values
       * constructs a comma seperated string if there are more than one reason
       * else constructs a string with the single reason
       */
      const reasonsArray = mapReasonsToDisplayValues(correction.reasons);
      const formattedReasons = reasonsArray.join(', ');

      return {
        correctionId,
        feeRecordId,
        exporter,
        status: FEE_RECORD_STATUS.PENDING_CORRECTION,
        formattedReasons,
        formattedDateSent: format(dateRequested, 'dd MMM yyyy'),
        formattedOldRecords,
        formattedCorrectRecords: '-',
      };
    });
  });
};
